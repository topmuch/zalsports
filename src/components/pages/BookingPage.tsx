'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  UserCheck,
  CreditCard,
  Zap,
  Check,
  X,
  ChevronRight,
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */

interface TimeSlot {
  id: string;
  time: string;
  label: string;
  available: boolean;
  price: number;
}

const VENUE = {
  pricePerHour: '25 000 FCFA',
};

type Step = 'select' | 'info' | 'payment' | 'confirm';

const STEP_CONFIG: { key: Step; label: string; icon: typeof CalendarDays }[] = [
  { key: 'select', label: 'Créneau', icon: CalendarDays },
  { key: 'info', label: 'Informations', icon: UserCheck },
  { key: 'payment', label: 'Paiement', icon: CreditCard },
];

function generateTimeSlots(availableHours?: Set<string>): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let h = 8; h <= 23; h++) {
    const timeStr = `${h.toString().padStart(2, '0')}:00`;
    const available = availableHours ? !availableHours.has(timeStr) : true;
    slots.push({
      id: `slot-${h}`,
      time: timeStr,
      label: `${timeStr} – ${(h + 1).toString().padStart(2, '0')}:00`,
      available,
      price: 25000,
    });
  }
  return slots;
}

/* ═══════════════════════════════════════════
   Slot Grid Button
   ═══════════════════════════════════════════ */

function SlotGridButton({ slot, selected, onClick }: { slot: TimeSlot; selected: boolean; onClick: () => void }) {
  return (
    <button
      disabled={!slot.available}
      onClick={onClick}
      className={
        `relative rounded-xl p-3 text-sm font-bold transition-all duration-200 ${
          !slot.available
            ? 'bg-red-50 border-2 border-red-300 text-red-400 cursor-not-allowed line-through'
            : selected
              ? 'bg-green-800 text-white border-2 border-green-800 shadow-lg shadow-green-800/30 scale-105'
              : 'bg-green-50 border-2 border-green-700 text-green-900 hover:bg-green-100 hover:border-green-800'
        }`
      }
    >
      {slot.time}
      {!slot.available && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400" />
      )}
      {selected && (
        <Check className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-white" />
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════
   Booking Page
   ═══════════════════════════════════════════ */

export default function BookingPage({ onBack }: { onBack: () => void }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [step, setStep] = useState<Step>('select');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wave' | 'orange_money' | 'cash' | null>(null);
  const [paymentPhone, setPaymentPhone] = useState('');
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [fullyBookedDates, setFullyBookedDates] = useState<string[]>([]);

  const fullyBookedSet = useMemo(() => new Set(fullyBookedDates), [fullyBookedDates]);

  const stepIndex = step === 'select' ? 0 : step === 'info' ? 1 : step === 'payment' ? 2 : 3;

  const fetchSlots = useCallback(async (date: Date) => {
    setLoadingSlots(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const res = await fetch(`/api/bookings?date=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        const bookedSet = new Set(
          data.available
            .filter((s: { time: string; available: boolean }) => !s.available)
            .map((s: { time: string; available: boolean }) => s.time)
        );
        setSlots(generateTimeSlots(bookedSet));
      } else {
        setSlots(generateTimeSlots());
      }
    } catch {
      setSlots(generateTimeSlots());
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    const tomorrow = addDays(new Date(), 1);
    setSelectedDate(tomorrow);
    fetchSlots(tomorrow);
  }, [fetchSlots]);

  useEffect(() => {
    if (selectedDate) {
      setSelectedSlot(null);
      fetchSlots(selectedDate);
    }
  }, [selectedDate, fetchSlots]);

  // Fetch fully booked dates for calendar coloring
  useEffect(() => {
    if (!selectedDate) return;
    const monthStr = format(selectedDate, 'yyyy-MM');
    fetch(`/api/bookings/month-availability?month=${monthStr}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.fullyBooked) setFullyBookedDates(data.fullyBooked);
      })
      .catch(() => {});
  }, [selectedDate]);

  const handleConfirmInfo = useCallback(async () => {
    if (!selectedSlot || !selectedDate || !name || !phone) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: format(selectedDate, 'yyyy-MM-dd'),
          timeSlot: selectedSlot.time,
          customerName: name,
          customerPhone: phone,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setBookingId(data.id || data.booking?.id || null);
        setPaymentPhone(phone);
        setStep('payment');
      }
    } catch {
      // silent
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedSlot, selectedDate, name, phone]);

  const handleInitiatePayment = useCallback(async () => {
    if (!paymentMethod || !bookingId) return;
    if (paymentMethod !== 'cash' && !paymentPhone) return;

    setIsPaying(true);
    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'confirmed',
          paymentStatus: paymentMethod === 'cash' ? 'pending' : 'partial',
          paymentMethod,
          depositPaid: paymentMethod === 'cash' ? 0 : 5000,
        }),
      });
      setStep('confirm');
    } catch {
      // silent
    } finally {
      setIsPaying(false);
    }
  }, [paymentMethod, paymentPhone, bookingId]);

  /* ──── Confirm step ──── */
  if (step === 'confirm') {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        {/* Header */}
        <header className="border-b border-border bg-white sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Retour">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold">Réservation</h1>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-green-700" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Réservation confirmée !</h2>
            <p className="text-muted-foreground">Votre créneau a été réservé avec succès. Vous recevrez un SMS de confirmation.</p>

            <div className="bg-gray-50 rounded-2xl p-5 space-y-3 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{selectedDate && format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Créneau</span>
                <span className="font-medium">{selectedSlot?.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Méthode de paiement</span>
                <span className="font-medium">{paymentMethod === 'wave' ? 'Wave' : paymentMethod === 'orange_money' ? 'Orange Money' : 'Espèces'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Acompte</span>
                <span className="font-medium text-green-700">{paymentMethod === 'cash' ? 'Sur place' : '5 000 FCFA'}</span>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-left">
              <p className="text-sm text-green-700 font-medium">Réservation confirmée</p>
              <p className="text-xs text-green-600/80 mt-1">
                {paymentMethod === 'cash'
                  ? 'Présentez-vous avec le montant total (25 000 FCFA) à votre arrivée.'
                  : `Acompte de 5 000 FCFA via ${paymentMethod === 'wave' ? 'Wave' : 'Orange Money'}. Le solde (20 000 FCFA) se paie sur place.`}
              </p>
            </div>

            <Button size="lg" className="w-full bg-green-700 hover:bg-green-800 text-white" onClick={onBack}>
              Retour à l'accueil
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header with step indicator */}
      <header className="border-b border-border bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Retour">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Réservation</h1>
          <div className="flex-1" />
          {/* Step indicator */}
          <div className="hidden sm:flex items-center gap-1">
            {STEP_CONFIG.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === stepIndex;
              const isDone = i < stepIndex;
              return (
                <div key={s.key} className="flex items-center">
                  {i > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground/40 mx-1" />}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isActive ? 'bg-green-100 text-green-800' : isDone ? 'bg-green-50 text-green-600' : 'text-muted-foreground/50'
                  }`}>
                    {isDone ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                    <span>{s.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Mobile step indicator */}
        <div className="sm:hidden border-t border-border/50 px-4 py-2">
          <div className="flex items-center gap-2">
            {STEP_CONFIG.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === stepIndex;
              const isDone = i < stepIndex;
              return (
                <div key={s.key} className="flex items-center flex-1">
                  {i > 0 && <div className={`h-0.5 flex-1 ${i <= stepIndex ? 'bg-green-400' : 'bg-gray-200'}`} />}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    isActive ? 'bg-green-700 text-white' : isDone ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {STEP_CONFIG.map((s, i) => (
              <span key={s.key} className={`flex-1 text-[10px] text-center ${
                i === stepIndex ? 'text-green-700 font-medium' : 'text-muted-foreground/50'
              }`}>{s.label}</span>
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Step title */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
              {step === 'select' && '⚡ Réservez votre match en 30 secondes'}
              {step === 'info' && '📋 Vos informations'}
              {step === 'payment' && '💳 Méthode de paiement'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {step === 'select' && 'Choisissez votre date et votre horaire'}
              {step === 'info' && 'Complétez vos informations pour confirmer'}
              {step === 'payment' && 'Choisissez comment payer l\'acompte'}
            </p>
          </div>

          {/* ──── SELECT STEP ──── */}
          {step === 'select' && (
            <div className="space-y-6">
              {/* Calendar + Field Image */}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Calendar */}
                <div className="flex-1">
                  <div className="border-[3px] border-green-800 rounded-2xl p-3 sm:p-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={{ before: new Date() }}
                      className="rounded-xl"
                      modifiers={{
                        fullyBooked: fullyBookedDates.map((d) => new Date(d + 'T00:00:00')),
                      }}
                      modifiersClassNames={{
                        fullyBooked: 'bg-red-100 text-red-600 font-bold line-through',
                        day_selected: 'bg-green-800 text-white rounded-md font-bold',
                        day_today: 'bg-green-100 text-green-900 rounded-md font-bold ring-2 ring-green-400',
                      }}
                    />
                  </div>
                </div>
                {/* Field Image */}
                <div className="hidden lg:flex flex-col items-center justify-center w-[300px] xl:w-[360px]">
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-[3px] border-green-800 shadow-xl">
                    <Image
                      src="/terrain.png"
                      alt="Terrain ZalFoot"
                      fill
                      className="object-cover"
                      sizes="360px"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <p className="text-white font-bold text-base">ZalFoot Arena</p>
                      <p className="text-white/80 text-sm">Synthétique • LED • Vestiaires</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 justify-center">
                <div className="flex items-center gap-2 px-5 py-3 bg-green-50 border-2 border-green-700 rounded-xl">
                  <span className="w-8 h-8 rounded-lg bg-green-700 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </span>
                  <span className="text-base font-bold text-green-900">Disponible</span>
                </div>
                <div className="flex items-center gap-2 px-5 py-3 bg-red-50 border-2 border-red-300 rounded-xl">
                  <span className="w-8 h-8 rounded-lg bg-red-400 flex items-center justify-center">
                    <X className="w-4 h-4 text-white" />
                  </span>
                  <span className="text-base font-bold text-red-700">Complet</span>
                </div>
                <div className="flex items-center gap-2 px-5 py-3 bg-green-800 border-2 border-green-800 rounded-xl">
                  <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </span>
                  <span className="text-base font-bold text-white">Sélectionné</span>
                </div>
              </div>

              {/* Time Slots Grid */}
              {selectedDate && (
                <div>
                  <p className="text-sm font-bold text-foreground mb-3">
                    Créneaux — {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
                  </p>
                  <div className="border-[3px] border-green-800 rounded-2xl p-4 sm:p-5">
                    {loadingSlots ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="h-12 rounded-xl bg-green-100 animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                        {slots.map((slot) => (
                          <SlotGridButton
                            key={slot.id}
                            slot={slot}
                            selected={selectedSlot?.id === slot.id}
                            onClick={() => setSelectedSlot(slot)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ──── INFO STEP ──── */}
          {step === 'info' && (
            <div className="max-w-lg space-y-6">
              {/* Summary card */}
              <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-foreground">Récapitulatif</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{selectedDate && format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Créneau</span>
                  <span className="font-medium">{selectedSlot?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Prix</span>
                  <span className="font-bold text-green-700">{VENUE.pricePerHour}</span>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bname" className="text-sm font-medium">Nom complet</Label>
                  <Input id="bname" placeholder="Votre nom" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 h-12 text-base" />
                </div>
                <div>
                  <Label htmlFor="bphone" className="text-sm font-medium">Téléphone</Label>
                  <Input id="bphone" placeholder="+221 7X XXX XX XX" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5 h-12 text-base" />
                </div>
              </div>
            </div>
          )}

          {/* ──── PAYMENT STEP ──── */}
          {step === 'payment' && (
            <div className="max-w-lg space-y-6">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-foreground">Récapitulatif</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{selectedDate && format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Créneau</span>
                  <span className="font-medium">{selectedSlot?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Nom</span>
                  <span className="font-medium">{name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Prix</span>
                  <span className="font-bold text-green-700">{VENUE.pricePerHour}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-bold">Méthode de paiement</Label>
                <div className="space-y-3">
                  {/* Wave Card */}
                  <button
                    type="button"
                    onClick={() => {
                      if (paymentMethod === 'wave') { setPaymentMethod(null); setPaymentPhone(''); }
                      else { setPaymentMethod('wave'); setPaymentPhone(phone); }
                    }}
                    className={`w-full rounded-2xl border-2 p-4 sm:p-5 text-left transition-all flex items-center gap-4 ${
                      paymentMethod === 'wave'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-border bg-white hover:border-emerald-300'
                    }`}
                  >
                    <Image src="/pay-wave.png" alt="Wave" width={56} height={56} className="w-14 h-14 object-contain rounded-xl" />
                    <div className="flex-1">
                      <p className={`font-bold ${paymentMethod === 'wave' ? 'text-emerald-700' : 'text-foreground'}`}>Wave</p>
                      <p className={`text-sm ${paymentMethod === 'wave' ? 'text-emerald-600' : 'text-muted-foreground'}`}>Payer avec Wave</p>
                    </div>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === 'wave' ? 'border-emerald-500 bg-emerald-500' : 'border-muted-foreground/30'
                    }`}>
                      {paymentMethod === 'wave' && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </button>
                  {paymentMethod === 'wave' && (
                    <input
                      type="tel"
                      placeholder="Numéro Wave"
                      value={paymentPhone}
                      onChange={(e) => setPaymentPhone(e.target.value)}
                      className="w-full rounded-xl border-2 border-emerald-300 bg-emerald-50/50 text-foreground placeholder:text-muted-foreground text-base px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  )}

                  {/* Orange Money Card */}
                  <button
                    type="button"
                    onClick={() => {
                      if (paymentMethod === 'orange_money') { setPaymentMethod(null); setPaymentPhone(''); }
                      else { setPaymentMethod('orange_money'); setPaymentPhone(phone); }
                    }}
                    className={`w-full rounded-2xl border-2 p-4 sm:p-5 text-left transition-all flex items-center gap-4 ${
                      paymentMethod === 'orange_money'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-border bg-white hover:border-orange-300'
                    }`}
                  >
                    <Image src="/pay-orange-money.jpg" alt="Orange Money" width={56} height={56} className="w-14 h-14 object-contain rounded-xl" />
                    <div className="flex-1">
                      <p className={`font-bold ${paymentMethod === 'orange_money' ? 'text-orange-700' : 'text-foreground'}`}>Orange Money</p>
                      <p className={`text-sm ${paymentMethod === 'orange_money' ? 'text-orange-600' : 'text-muted-foreground'}`}>Payer avec Orange Money</p>
                    </div>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === 'orange_money' ? 'border-orange-500 bg-orange-500' : 'border-muted-foreground/30'
                    }`}>
                      {paymentMethod === 'orange_money' && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </button>
                  {paymentMethod === 'orange_money' && (
                    <input
                      type="tel"
                      placeholder="Numéro OM"
                      value={paymentPhone}
                      onChange={(e) => setPaymentPhone(e.target.value)}
                      className="w-full rounded-xl border-2 border-orange-300 bg-orange-50/50 text-foreground placeholder:text-muted-foreground text-base px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  )}

                  {/* Espèces Card */}
                  <button
                    type="button"
                    onClick={() => {
                      if (paymentMethod === 'cash') { setPaymentMethod(null); setPaymentPhone(''); }
                      else { setPaymentMethod('cash'); setPaymentPhone(''); }
                    }}
                    className={`w-full rounded-2xl border-2 p-4 sm:p-5 text-left transition-all flex items-center gap-4 ${
                      paymentMethod === 'cash'
                        ? 'border-gray-600 bg-gray-100'
                        : 'border-border bg-white hover:border-gray-400'
                    }`}
                  >
                    <Image src="/pay-especes.png" alt="Espèces" width={56} height={56} className="w-14 h-14 object-contain rounded-xl" />
                    <div className="flex-1">
                      <p className={`font-bold ${paymentMethod === 'cash' ? 'text-gray-800' : 'text-foreground'}`}>Espèces</p>
                      <p className={`text-sm ${paymentMethod === 'cash' ? 'text-gray-600' : 'text-muted-foreground'}`}>Payer sur place</p>
                    </div>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === 'cash' ? 'border-gray-600 bg-gray-600' : 'border-muted-foreground/30'
                    }`}>
                      {paymentMethod === 'cash' && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </button>
                </div>
              </div>

              {/* Deposit Amount */}
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 text-center">
                <p className="text-sm text-muted-foreground">Acompte</p>
                <p className="text-3xl font-extrabold text-green-700">5 000 FCFA</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Sticky bottom action bar */}
      <div className="sticky bottom-0 border-t border-border bg-white/95 backdrop-blur-sm p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {step === 'select' && (
            <Button className="w-full h-12 text-base" size="lg" disabled={!selectedSlot} onClick={() => setStep('info')}>
              Continuer <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          )}
          {step === 'info' && (
            <div className="flex gap-3 max-w-lg">
              <Button variant="outline" className="flex-1 h-12" onClick={() => setStep('select')}>Retour</Button>
              <Button
                className="flex-1 h-12 bg-green-700 hover:bg-green-800 text-white"
                size="lg"
                disabled={!name || !phone || isSubmitting}
                onClick={handleConfirmInfo}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Réservation...
                  </span>
                ) : (
                  'Confirmer'
                )}
              </Button>
            </div>
          )}
          {step === 'payment' && (
            <div className="space-y-3 max-w-lg">
              <Button
                className="w-full h-13 text-base py-5 bg-emerald-600 hover:bg-emerald-700 text-white"
                size="lg"
                disabled={!paymentMethod || (paymentMethod !== 'cash' && !paymentPhone) || isPaying}
                onClick={handleInitiatePayment}
              >
                {isPaying ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Traitement...
                  </span>
                ) : paymentMethod === 'cash' ? (
                  'Confirmer la réservation'
                ) : (
                  'Payer 5 000 FCFA'
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                {paymentMethod === 'cash' ? 'Paiement intégral sur place (25 000 FCFA)' : 'Le solde (20 000 FCFA) se paie sur place'}
              </p>
              <Button variant="outline" className="w-full" onClick={() => setStep('info')}>Retour</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
