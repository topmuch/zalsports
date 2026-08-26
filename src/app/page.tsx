'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MapPin,
  Clock,
  Users,
  Zap,
  ChevronDown,
  CalendarDays,
  ShieldCheck,
  ArrowRight,
  Menu,
  X,
  LogIn,
  CreditCard,
  User,
  Star,
  Search,
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import Dashboard from '@/components/dashboard';
import UserPanel from '@/components/user-panel';
import ContactPage from '@/components/pages/ContactPage';
import HowItWorksPage from '@/components/pages/HowItWorksPage';
import PricingPage from '@/components/pages/PricingPage';
import ConceptPage from '@/components/pages/ConceptPage';
import AboutPage from '@/components/pages/AboutPage';
import PrivacyPage from '@/components/pages/PrivacyPage';

/* ═══════════════════════════════════════════
   Types & Constants
   ═══════════════════════════════════════════ */

interface TimeSlot {
  id: string;
  time: string;
  label: string;
  available: boolean;
  price: number;
}

type PageView = 'landing' | 'dashboard' | 'user' | 'contact' | 'how-it-works' | 'pricing' | 'concept' | 'about' | 'privacy';

const NAV_LINKS = [
  { label: 'Terrain', href: '#terrains' },
  { label: 'Comment ça marche', view: 'how-it-works' as PageView },
  { label: 'Tarifs', href: '#pricing' },
  { label: 'Concept', view: 'concept' as PageView },
];

const FOOTER_LINKS = [
  { label: 'Contact', view: 'contact' as PageView },
  { label: 'Confidentialité', view: 'privacy' as PageView },
  { label: 'Mentions légales', view: 'about' as PageView },
  { label: 'À propos', view: 'about' as PageView },
];

const HERO_STATS = [
  { label: '1 Terrain', icon: MapPin },
  { label: '14 Joueurs max', icon: Users },
  { label: '08:00–00:00', icon: Clock },
  { label: 'Wave & Orange Money', icon: CreditCard },
];

const BANNER_STATS = [
  { value: 1250, suffix: '+', label: 'Matchs joués' },
  { value: 98, suffix: '%', label: 'Satisfaction' },
  { value: 14, suffix: '', label: 'Joueurs max' },
  { value: 7, suffix: 'j/7', label: 'Disponible' },
];

const STEPS = [
  {
    icon: CalendarDays,
    number: '01',
    title: 'Choisissez votre créneau',
    description: 'Consultez les disponibilités et sélectionnez votre date et horaire.',
  },
  {
    icon: ShieldCheck,
    number: '02',
    title: 'Réservez en 30 secondes',
    description: 'Entrez votre nom et numéro — aucun compte requis.',
  },
  {
    icon: CreditCard,
    number: '03',
    title: 'Payez l\'acompte',
    description: 'Acompte en ligne via Wave ou Orange Money. Le solde sur place.',
  },
];

const FEATURES = [
  {
    icon: Clock,
    title: 'Réservation rapide',
    description: 'Réservez votre créneau en 30 secondes, sans créer de compte.',
  },
  {
    icon: ShieldCheck,
    title: 'Paiement sécurisé',
    description: 'Payez votre acompte en toute sécurité via Wave ou Orange Money.',
  },
  {
    icon: MapPin,
    title: 'Terrain de qualité',
    description: 'Synthétique dernière génération, éclairage LED, vestiaires modernes.',
  },
  {
    icon: CalendarDays,
    title: 'Disponible 7j/7',
    description: 'Ouvert tous les jours de 08h à 00h pour votre plaisir.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Mamadou Diop',
    role: 'Capitaine – Équipe Diarama',
    rating: 5,
    quote: 'La réservation est super simple, même mon père pourrait le faire. Le terrain est impeccable et l\'éclairage top.',
  },
  {
    name: 'Ibrahima Fall',
    role: 'Joueur régulier',
    rating: 5,
    quote: 'Le paiement par Wave est très pratique. Plus besoin de chercher du liquide. J\'utilise ZalFoot chaque semaine.',
  },
  {
    name: 'Aminata Sow',
    role: 'Organisatrice de tournois',
    title: 'Organisatrice',
    rating: 5,
    quote: 'La qualité du terrain synthétique est au-dessus de ce qu\'on trouve ailleurs. Les vestiaires sont propres et modernes.',
  },
];

const VENUE = {
  name: 'ZalFoot Arena',
  location: 'Croisement Kaolack - Mbour, Sénégal',
  description:
    'Terrain synthétique dernière génération avec éclairage LED, vestiaires modernes et buvette.',
  pricePerHour: '25 000 FCFA',
  deposit: '5 000 FCFA',
  capacity: '14 joueurs',
  hours: '08:00 – 00:00',
};

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
   Animated Counter
   ═══════════════════════════════════════════ */

function AnimatedCounter({ value, suffix, inView }: { value: number; suffix: string; inView: boolean }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.max(1, Math.floor(value / 125));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span>
      {count.toLocaleString('fr-FR')}
      {suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════
   Section Wrapper
   ═══════════════════════════════════════════ */

function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.section>
  );
}

/* ═══════════════════════════════════════════
   Booking Dialog
   ═══════════════════════════════════════════ */

function BookingDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [step, setStep] = useState<'select' | 'info' | 'payment' | 'confirm'>('select');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wave' | 'orange_money' | null>(null);
  const [paymentPhone, setPaymentPhone] = useState('');
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);

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
    if (open) {
      const tomorrow = addDays(new Date(), 1);
      setSelectedDate(tomorrow);
      setSelectedSlot(null);
      setStep('select');
      setName('');
      setPhone('');
      setPaymentMethod(null);
      setPaymentPhone('');
      setBookingId(null);
      setIsPaying(false);
      setConfirmingPayment(false);
      fetchSlots(tomorrow);
    }
  }, [open, fetchSlots]);

  useEffect(() => {
    if (open && selectedDate) {
      setSelectedSlot(null);
      fetchSlots(selectedDate);
    }
  }, [selectedDate, open, fetchSlots]);

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
    if (!paymentMethod || !paymentPhone || !bookingId) return;
    setIsPaying(true);
    try {
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          method: paymentMethod,
          phone: paymentPhone,
          amount: 5000,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.paymentUrl) {
          window.open(data.paymentUrl, '_blank');
        }
        setStep('confirm');
      }
    } catch {
      // silent
    } finally {
      setIsPaying(false);
    }
  }, [paymentMethod, paymentPhone, bookingId]);

  const handleConfirmPaid = useCallback(async () => {
    if (!bookingId || !paymentMethod) return;
    setConfirmingPayment(true);
    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentStatus: 'partial',
          paymentMethod,
          depositPaid: 5000,
        }),
      });
      setStep('confirm');
    } catch {
      // silent
    } finally {
      setConfirmingPayment(false);
    }
  }, [bookingId, paymentMethod]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl bg-card border-border max-h-[95vh] overflow-hidden flex flex-col p-0">
        {step === 'confirm' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl">Réservation confirmée !</DialogTitle>
              <DialogDescription className="text-muted-foreground text-base mt-2">
                Votre créneau a été réservé avec succès. Vous recevrez un SMS de confirmation.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-secondary rounded-xl p-4 mt-4 w-full max-w-sm space-y-2">
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
                <span className="font-medium">{paymentMethod === 'wave' ? 'Wave' : paymentMethod === 'orange_money' ? 'Orange Money' : '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Acompte</span>
                <span className="font-medium text-primary">5 000 FCFA</span>
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 w-full max-w-sm mt-1">
              <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">Paiement initié — Vérifiez votre application</p>
              <p className="text-xs text-amber-600/80 dark:text-amber-500/70 mt-1">Si vous avez effectué le paiement, confirmez ci-dessous.</p>
            </div>
            <Button
              className="mt-2 w-full max-w-sm bg-primary hover:bg-primary/90"
              disabled={confirmingPayment}
              onClick={handleConfirmPaid}
            >
              {confirmingPayment ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Vérification...
                </span>
              ) : (
                "J'ai payé"
              )}
            </Button>
            <Button variant="outline" className="w-full max-w-sm" onClick={() => onOpenChange(false)}>Fermer</Button>
          </div>
        ) : (
          <>
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-xl font-bold">Réserver un créneau</DialogTitle>
              <DialogDescription>{step === 'select' ? 'Choisissez votre date et votre horaire' : step === 'info' ? 'Complétez vos informations' : 'Choisissez votre méthode de paiement'}</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6 pt-2 pb-4">
                  {step === 'select' && (
                    <div className="space-y-6">
                      <div>
                        <Label className="text-sm font-medium mb-3 block">Date</Label>
                        <div className="flex justify-center">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={{ before: new Date() }}
                            className="rounded-xl border border-border"
                            classNames={{
                              day_selected: 'bg-primary text-primary-foreground rounded-md',
                              day_today: 'bg-accent text-accent-foreground rounded-md',
                            }}
                          />
                        </div>
                      </div>
                      {selectedDate && (
                        <div>
                          <Label className="text-sm font-medium mb-3 block">
                            Créneaux — {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
                          </Label>
                          {loadingSlots ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="h-12 rounded-lg bg-secondary/50 animate-pulse" />
                              ))}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {slots.map((slot) => (
                                <button
                                  key={slot.id}
                                  disabled={!slot.available}
                                  onClick={() => setSelectedSlot(slot)}
                                  className={
                                    `relative p-3 rounded-lg border text-sm font-medium transition-all ${
                                      !slot.available
                                        ? 'border-border/50 bg-secondary/30 text-muted-foreground/50 cursor-not-allowed line-through'
                                        : selectedSlot?.id === slot.id
                                          ? 'border-primary bg-primary/15 text-primary glow-green'
                                          : 'border-border bg-secondary/50 hover:border-primary/50 hover:bg-secondary'
                                    }`
                                  }
                                >
                                  {slot.time}
                                  {!slot.available && (
                                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive/60" />
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {step === 'info' && (
                    <div className="space-y-4">
                      <div className="bg-secondary rounded-xl p-4 space-y-2">
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
                          <span className="font-medium">{VENUE.pricePerHour}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="name">Nom complet</Label>
                          <Input id="name" placeholder="Votre nom" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
                        </div>
                        <div>
                          <Label htmlFor="phone">Téléphone</Label>
                          <Input id="phone" placeholder="+221 7X XXX XX XX" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5" />
                        </div>
                      </div>
                    </div>
                  )}
                  {step === 'payment' && (
                    <div className="space-y-5">
                      {/* Order Summary */}
                      <div className="bg-secondary rounded-xl p-4 space-y-2">
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
                          <span className="font-medium">{VENUE.pricePerHour}</span>
                        </div>
                      </div>

                      {/* Payment Method Selection */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Méthode de paiement</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {/* Wave Card */}
                          <button
                            type="button"
                            onClick={() => { setPaymentMethod('wave'); setPaymentPhone(phone); }}
                            className={`relative rounded-xl p-4 text-left transition-all ${
                              paymentMethod === 'wave'
                                ? 'ring-2 ring-green-400 bg-gradient-to-br from-emerald-500 to-emerald-600'
                                : 'bg-gradient-to-br from-emerald-500/80 to-emerald-600/80 hover:from-emerald-500 hover:to-emerald-600'
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <svg viewBox="0 0 40 40" className="w-10 h-10 flex-shrink-0">
                                <circle cx="20" cy="20" r="20" fill="white" fillOpacity="0.2"/>
                                <text x="20" y="26" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="sans-serif">W</text>
                              </svg>
                              <div>
                                <p className="text-white font-bold text-sm">Wave</p>
                                <p className="text-white/80 text-xs">Payer avec Wave</p>
                              </div>
                            </div>
                            {paymentMethod === 'wave' && (
                              <div className="mt-1">
                                <input
                                  type="tel"
                                  placeholder="Numéro Wave"
                                  value={paymentPhone}
                                  onChange={(e) => setPaymentPhone(e.target.value)}
                                  className="w-full rounded-lg bg-white/20 border border-white/30 text-white placeholder:text-white/60 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            )}
                          </button>

                          {/* Orange Money Card */}
                          <button
                            type="button"
                            onClick={() => { setPaymentMethod('orange_money'); setPaymentPhone(phone); }}
                            className={`relative rounded-xl p-4 text-left transition-all ${
                              paymentMethod === 'orange_money'
                                ? 'ring-2 ring-orange-400 bg-gradient-to-br from-orange-500 to-orange-600'
                                : 'bg-gradient-to-br from-orange-500/80 to-orange-600/80 hover:from-orange-500 hover:to-orange-600'
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <svg viewBox="0 0 40 40" className="w-10 h-10 flex-shrink-0">
                                <circle cx="20" cy="20" r="20" fill="white" fillOpacity="0.2"/>
                                <text x="20" y="24" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="sans-serif">OM</text>
                              </svg>
                              <div>
                                <p className="text-white font-bold text-sm">Orange Money</p>
                                <p className="text-white/80 text-xs">Payer avec Orange Money</p>
                              </div>
                            </div>
                            {paymentMethod === 'orange_money' && (
                              <div className="mt-1">
                                <input
                                  type="tel"
                                  placeholder="Numéro OM"
                                  value={paymentPhone}
                                  onChange={(e) => setPaymentPhone(e.target.value)}
                                  className="w-full rounded-lg bg-white/20 border border-white/30 text-white placeholder:text-white/60 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Deposit Amount */}
                      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center">
                        <p className="text-sm text-muted-foreground">Acompte</p>
                        <p className="text-2xl font-extrabold text-primary">5 000 FCFA</p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
            {/* Sticky action buttons outside scroll */}
            <div className="shrink-0 border-t border-border p-4 bg-card">
              {step === 'select' && (
                <Button className="w-full" size="lg" disabled={!selectedSlot} onClick={() => setStep('info')}>
                  Continuer <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
              {step === 'info' && (
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep('select')}>Retour</Button>
                  <Button
                    className="flex-1"
                    size="lg"
                    disabled={!name || !phone || isSubmitting}
                    onClick={handleConfirmInfo}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Réservation...
                      </span>
                    ) : (
                      'Confirmer'
                    )}
                  </Button>
                </div>
              )}
              {step === 'payment' && (
                <div className="space-y-3">
                  <Button
                    className="w-full text-base py-5 bg-emerald-600 hover:bg-emerald-700 text-white"
                    size="lg"
                    disabled={!paymentMethod || !paymentPhone || isPaying}
                    onClick={handleInitiatePayment}
                  >
                    {isPaying ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Traitement...
                      </span>
                    ) : (
                      `Payer 5 000 FCFA`
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Le solde (20 000 FCFA) se paie sur place
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => setStep('info')}>Retour</Button>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════ */

export default function HomePage() {
  const [view, setView] = useState<PageView>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleBackToLanding = useCallback(() => {
    setView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateTo = useCallback((v: PageView) => {
    setView(v);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const bannerStatsRef = useRef<HTMLDivElement>(null);
  const bannerStatsInView = useInView(bannerStatsRef, { once: true });

  if (view === 'dashboard') {
    return <Dashboard onBack={handleBackToLanding} />;
  }
  if (view === 'user') {
    return <UserPanel onBack={handleBackToLanding} />;
  }
  if (view === 'contact') {
    return <ContactPage onBack={handleBackToLanding} />;
  }
  if (view === 'how-it-works') {
    return <HowItWorksPage onBack={handleBackToLanding} />;
  }
  if (view === 'pricing') {
    return <PricingPage onBack={handleBackToLanding} onBook={() => { setView('landing'); setTimeout(() => setBookingOpen(true), 100); }} />;
  }
  if (view === 'concept') {
    return <ConceptPage onBack={handleBackToLanding} />;
  }
  if (view === 'about') {
    return <AboutPage onBack={handleBackToLanding} />;
  }
  if (view === 'privacy') {
    return <PrivacyPage onBack={handleBackToLanding} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ═══════ 1. NAVBAR ═══════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-sm'
            : 'bg-white/95 backdrop-blur-xl'
        }`}
      >
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo only – no text */}
          <a href="#" className="flex items-center" onClick={() => { setView('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <Image src="/logo.png" alt="ZalFoot" width={96} height={96} className="rounded-lg w-[72px] h-[72px] sm:w-[96px] sm:h-[96px]" />
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) =>
              'view' in link && link.view ? (
                <button
                  key={link.label}
                  onClick={() => navigateTo(link.view!)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </button>
              ) : (
                <a
                  key={link.label}
                  href={(link as { href: string }).href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ),
            )}
            <button
              onClick={() => navigateTo('dashboard')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              Connexion
            </button>
            <Button size="sm" className="glow-green" onClick={() => setBookingOpen(true)}>
              <Zap className="w-4 h-4 mr-1.5" />
              Réserver
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-border overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {NAV_LINKS.map((link) =>
                  'view' in link && link.view ? (
                    <button
                      key={link.label}
                      onClick={() => navigateTo(link.view!)}
                      className="block w-full text-left py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <a
                      key={link.label}
                      href={(link as { href: string }).href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-left py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  ),
                )}
                <div className="border-t border-border my-2" />
                <button
                  onClick={() => navigateTo('user')}
                  className="flex items-center gap-1.5 w-full text-left py-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <User className="w-4 h-4" /> Mon espace
                </button>
                <button
                  onClick={() => navigateTo('dashboard')}
                  className="flex items-center gap-1.5 w-full text-left py-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <LogIn className="w-4 h-4" /> Connexion
                </button>
                <Button
                  className="w-full glow-green mt-2"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setBookingOpen(true);
                  }}
                >
                  <Zap className="w-4 h-4 mr-1.5" /> Réserver
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ═══════ MAIN CONTENT ═══════ */}
      <main className="flex-1 pt-20">

        {/* ═══════ 2. HERO SECTION (white bg, top) ═══════ */}
        <section className="bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12 sm:pb-16 text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm font-medium border-primary/30 text-primary bg-primary/5">
                ⚽ Football · Sénégal
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight leading-[1.15] text-foreground max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Réservez votre terrain de football{' '}
              <span className="text-primary">en 30 secondes</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Terrain synthétique, éclairage LED, vestiaires. Aucun compte requis.
            </motion.p>

            {/* 2 CTAs */}
            <motion.div
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button size="lg" className="text-base px-8 glow-green" onClick={() => setBookingOpen(true)}>
                <Zap className="w-4 h-4 mr-2" />
                Réserver maintenant
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8" onClick={() => navigateTo('how-it-works')}>
                Comment ça marche
              </Button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {HERO_STATS.map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <stat.icon className="w-4 h-4 text-primary" />
                  <span>{stat.label}</span>
                  {i < HERO_STATS.length - 1 && (
                    <span className="hidden sm:inline text-border mx-1">|</span>
                  )}
                </div>
              ))}
            </motion.div>

            {/* City tag pill */}
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Badge variant="secondary" className="px-4 py-2 text-sm font-normal gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Croisement Kaolack - Mbour
              </Badge>
            </motion.div>
          </div>
        </section>

        {/* ═══════ 3. QUICK SEARCH BAR ═══════ */}
        <section className="bg-white pb-16 sm:pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="bg-white rounded-2xl shadow-lg shadow-black/[0.06] border border-border p-5 sm:p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                {/* Sport select */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Sport</Label>
                  <Select defaultValue="football">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="football">Football</SelectItem>
                      <SelectItem value="basketball">Basketball</SelectItem>
                      <SelectItem value="futsal">Futsal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Date</Label>
                  <Input
                    type="date"
                    defaultValue={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>

                {/* Heure */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Heure</Label>
                  <Select defaultValue="18:00">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 15 }, (_, i) => i + 8).map((h) => (
                        <SelectItem key={h} value={`${h.toString().padStart(2, '0')}:00`}>
                          {h.toString().padStart(2, '0')}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Search button */}
                <Button className="w-full sm:w-auto" size="lg" onClick={() => setBookingOpen(true)}>
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════ 4. STATS BANNER (green bg) ═══════ */}
        <section ref={bannerStatsRef} className="bg-primary">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-6">
              {BANNER_STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={bannerStatsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                >
                  <p className="text-3xl sm:text-4xl font-extrabold text-primary-foreground">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} inView={bannerStatsInView} />
                  </p>
                  <p className="mt-1.5 text-sm text-primary-foreground/80 font-medium">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ 5. HOW IT WORKS ═══════ */}
        <Section className="py-16 sm:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-14">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
                Simple & rapide
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Comment ça marche ?
              </h2>
              <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                En 3 étapes simples, réservez votre créneau.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.number}
                  className="step-card bg-white rounded-2xl p-6 sm:p-8 relative"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                >
                  {/* Step number badge */}
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-bold mb-4">
                    {s.number}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <s.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ═══════ 6. FEATURES / ADVANTAGES ═══════ */}
        <Section className="py-16 sm:py-24 bg-secondary/40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Pourquoi ZalFoot Arena ?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  className="bg-white rounded-2xl p-6 sm:p-8 border border-border/60"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ═══════ 7. VENUE SECTION ═══════ */}
        <Section id="terrains" className="py-16 sm:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{VENUE.name}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              {/* Terrain images — 2 photos stacked */}
              <div className="lg:col-span-3 space-y-4">
                <div className="relative rounded-2xl overflow-hidden aspect-[16/10]">
                  <Image
                    src="/terrain1.jpg"
                    alt={`${VENUE.name} — Vue 1`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-foreground">{VENUE.location}</span>
                  </div>
                </div>
                <div className="relative rounded-2xl overflow-hidden aspect-[16/10]">
                  <Image
                    src="/terrain2.jpg"
                    alt={`${VENUE.name} — Vue 2`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                </div>
              </div>

              {/* Venue info card */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{VENUE.description}</p>
                <div className="space-y-3">
                  {[
                    { label: 'Emplacement', value: VENUE.location, icon: MapPin },
                    { label: 'Prix / heure', value: VENUE.pricePerHour, icon: CreditCard },
                    { label: 'Capacité', value: VENUE.capacity, icon: Users },
                    { label: 'Horaires', value: VENUE.hours, icon: Clock },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{item.label}</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button size="lg" className="w-full glow-green mt-2" onClick={() => setBookingOpen(true)}>
                  Voir les créneaux
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Section>

        {/* ═══════ 8. PRICING SECTION ═══════ */}
        <Section id="pricing" className="py-16 sm:py-24 bg-secondary/40">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Un prix, pas de surprise</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {/* Full price card */}
              <motion.div
                className="bg-white rounded-2xl border border-border p-6 sm:p-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">1 heure</h3>
                <p className="text-3xl font-extrabold text-primary">
                  25 000 <span className="text-base font-normal text-muted-foreground">FCFA</span>
                </p>
                <p className="text-sm text-muted-foreground mt-2">Jusqu&rsquo;à 14 joueurs</p>
              </motion.div>

              {/* Deposit card */}
              <motion.div
                className="bg-white rounded-2xl border-2 border-primary/40 p-6 sm:p-8 text-center relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="absolute top-3 right-3">
                  <Badge className="bg-primary text-primary-foreground text-xs">Populaire</Badge>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">Acompte</h3>
                <p className="text-3xl font-extrabold text-primary">
                  5 000 <span className="text-base font-normal text-muted-foreground">FCFA</span>
                </p>
                <p className="text-sm text-muted-foreground mt-2">Le reste sur place</p>
              </motion.div>
            </div>
          </div>
        </Section>

        {/* ═══════ 9. TESTIMONIALS ═══════ */}
        <Section className="py-16 sm:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                ★ Ils nous font confiance
              </h2>
              <p className="mt-3 text-muted-foreground">Joueurs satisfaits</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={t.name}
                  className="bg-white rounded-2xl border border-border p-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                >
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <blockquote className="text-sm text-muted-foreground leading-relaxed mb-5">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div>
                    <p className="text-sm font-bold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ═══════ 10. CTA SECTION ═══════ */}
        <Section className="py-16 sm:py-24 bg-secondary/40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Prêt à jouer ?
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-md mx-auto">
              Réservez votre créneau dès maintenant
            </p>
            <Button size="lg" className="text-base px-10 py-6 glow-green" onClick={() => setBookingOpen(true)}>
              <Zap className="w-5 h-5 mr-2" />
              Réserver maintenant
            </Button>
          </div>
        </Section>
      </main>

      {/* ═══════ 11. FOOTER (sticky, mt-auto) ═══════ */}
      <footer className="border-t border-border py-8 mt-auto bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="ZalFoot" width={72} height={72} className="rounded-lg w-[56px] h-[56px] sm:w-[72px] sm:h-[72px]" />
            <span className="text-sm font-semibold text-foreground">
              <span className="text-primary">Zal</span>Foot
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ZalFoot — Réservation de terrains, Sénégal
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            {FOOTER_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => navigateTo(link.view)}
                className="hover:text-foreground transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </footer>

      <BookingDialog open={bookingOpen} onOpenChange={setBookingOpen} />
    </div>
  );
}
