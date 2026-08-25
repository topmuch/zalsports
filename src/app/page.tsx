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
  LayoutDashboard,
  CreditCard,
  User,
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

const STATS = [
  { value: 1250, suffix: '+', label: 'Matchs joués' },
  { value: 98, suffix: '%', label: 'Satisfaction' },
  { value: 14, suffix: '', label: 'Joueurs max' },
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
        method: 'PATCH',
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
      <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[90vh] overflow-hidden flex flex-col p-0">
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
              <ScrollArea className="h-full max-h-[60vh]">
                <div className="p-6 pt-2">
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
                      {selectedSlot && (
                        <Button className="w-full" size="lg" onClick={() => setStep('info')}>
                          Continuer <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
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
                      <div className="flex gap-3 pt-2">
                        <Button variant="outline" className="flex-1" onClick={() => setStep('select')}>Retour</Button>
                        <Button
                          className="flex-1"
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

                      {/* Pay Button */}
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

                      {/* Balance info */}
                      <p className="text-xs text-center text-muted-foreground">
                        Le solde (20 000 FCFA) se paie sur place
                      </p>

                      {/* Back Button */}
                      <Button variant="outline" className="w-full" onClick={() => setStep('info')}>Retour</Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
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

  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true });

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
    <div className="min-h-screen flex flex-col">
      {/* ─── Navbar ─── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-border shadow-sm' : 'bg-transparent'
        }`}
      >
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <Image src="/logo.png" alt="ZalFoot" width={48} height={48} className="rounded-lg" />
            <span className={`text-2xl font-bold tracking-tight transition-colors ${scrolled ? '' : 'text-white'}`}>
              <span className={scrolled ? 'text-primary' : 'text-green-400'}>Zal</span>
              <span className={scrolled ? 'text-foreground' : 'text-white'}>Foot</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-5">
            {NAV_LINKS.map((link) => (
              'view' in link && link.view ? (
                <button
                  key={link.label}
                  onClick={() => navigateTo(link.view!)}
                  className={`text-sm transition-colors ${scrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/80 hover:text-white'}`}
                >
                  {link.label}
                </button>
              ) : (
                <a key={link.label} href={(link as { href: string }).href} className={`text-sm transition-colors ${scrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/80 hover:text-white'}`}>
                  {link.label}
                </a>
              )
            ))}
            <div className={`w-px h-4 ${scrolled ? 'bg-border' : 'bg-white/20'}`} />
            <button
              onClick={() => navigateTo('about')}
              className={`text-sm transition-colors ${scrolled ? 'text-muted-foreground hover:text-primary' : 'text-white/80 hover:text-white'}`}
            >
              À propos
            </button>
            <button
              onClick={() => navigateTo('contact')}
              className={`text-sm transition-colors ${scrolled ? 'text-muted-foreground hover:text-primary' : 'text-white/80 hover:text-white'}`}
            >
              Contact
            </button>
            <button
              onClick={() => navigateTo('user')}
              className={`text-sm transition-colors flex items-center gap-1.5 ${scrolled ? 'text-muted-foreground hover:text-primary' : 'text-white/80 hover:text-white'}`}
            >
              <User className="w-3.5 h-3.5" />
              Mon espace
            </button>
            <button
              onClick={() => navigateTo('dashboard')}
              className={`text-sm transition-colors flex items-center gap-1.5 ${scrolled ? 'text-muted-foreground hover:text-primary' : 'text-white/80 hover:text-white'}`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </button>
            <Button size="sm" className="glow-green" onClick={() => setBookingOpen(true)}>
              <Zap className="w-4 h-4 mr-1.5" />
              Réserver
            </Button>
          </div>

          <button className={`md:hidden p-2 ${scrolled ? 'text-foreground' : 'text-white'}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border overflow-hidden"
            >
              <div className="px-4 py-4 space-y-3">
                {NAV_LINKS.map((link) => (
                  'view' in link && link.view ? (
                    <button
                      key={link.label}
                      onClick={() => navigateTo(link.view!)}
                      className="block py-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <a key={link.label} href={(link as { href: string }).href} onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-muted-foreground hover:text-foreground">
                      {link.label}
                    </a>
                  )
                ))}
                <button
                  onClick={() => navigateTo('about')}
                  className="block py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  À propos
                </button>
                <button
                  onClick={() => navigateTo('contact')}
                  className="block py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  Contact
                </button>
                <button
                  onClick={() => navigateTo('user')}
                  className="flex items-center gap-1.5 py-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <User className="w-3.5 h-3.5" /> Mon espace
                </button>
                <button
                  onClick={() => navigateTo('dashboard')}
                  className="flex items-center gap-1.5 py-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                </button>
                <Button className="w-full glow-green" onClick={() => { setMobileMenuOpen(false); setBookingOpen(true); }}>
                  <Zap className="w-4 h-4 mr-1.5" /> Réserver
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        {/* ─── Hero ─── */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <Image src="/hero-bg.png" alt="Terrain de football" fill className="object-cover" priority quality={85} />
            <div className="hero-overlay absolute inset-0" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center pt-20">
            <Badge className="mb-6 px-4 py-1.5 text-sm bg-white/15 text-white border border-white/20 backdrop-blur-sm">
              <MapPin className="w-3.5 h-3.5 mr-1.5" />
              CROISEMENT KAOLACK - MBOUR · SÉNÉGAL
            </Badge>
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              Le match
              <br />
              <span className="text-green-400">commence ici.</span>
            </motion.h1>
            <motion.p
              className="mt-6 text-lg sm:text-xl text-white/80 max-w-xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Réservez votre terrain en 30 secondes. Aucun compte requis.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="mt-10">
              <Button size="lg" className="text-lg px-8 py-6 glow-green" onClick={() => setBookingOpen(true)}>
                <Zap className="w-5 h-5 mr-2" /> Réserver maintenant
              </Button>
            </motion.div>
            <motion.div
              className="absolute bottom-8 left-1/2 -translate-x-1/2 bounce-down"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <ChevronDown className="w-6 h-6 text-white/60" />
            </motion.div>
          </div>
        </section>

        {/* ─── Stats ─── */}
        <section ref={statsRef} className="relative z-10 -mt-12 sm:-mt-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="bg-card/80 backdrop-blur-lg border border-border rounded-2xl p-4 sm:p-6 text-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={statsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                >
                  <div className="text-2xl sm:text-4xl font-extrabold text-primary">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} inView={statsInView} />
                  </div>
                  <div className="mt-1 text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <Section id="steps" className="py-20 sm:py-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Simple & rapide</p>
              <h2 className="text-2xl sm:text-3xl font-bold">Comment ça marche</h2>
              <button onClick={() => navigateTo('how-it-works')} className="mt-3 text-sm text-primary hover:underline inline-flex items-center gap-1">
                En savoir plus <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.number}
                  className="step-card bg-card rounded-2xl p-6 sm:p-8"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <s.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-3xl font-black text-primary/10">{s.number}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ─── Venue Section ─── */}
        <Section id="terrains" className="py-20 sm:py-28 bg-secondary/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Le terrain</p>
              <h2 className="text-2xl sm:text-3xl font-bold">{VENUE.name}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="relative rounded-2xl overflow-hidden aspect-video">
                <Image src="/terrain.png" alt={VENUE.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-background/70 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium">{VENUE.location}</span>
                </div>
              </div>

              <div className="space-y-5">
                <p className="text-muted-foreground leading-relaxed">{VENUE.description}</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Prix / heure', value: VENUE.pricePerHour, icon: CreditCard },
                    { label: 'Acompte', value: VENUE.deposit, icon: ShieldCheck },
                    { label: 'Capacité', value: VENUE.capacity, icon: Users },
                    { label: 'Horaires', value: VENUE.hours, icon: Clock },
                  ].map((item) => (
                    <div key={item.label} className="bg-card rounded-xl p-4 border border-border">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 font-medium">{item.label}</p>
                      <div className="flex items-center gap-2">
                        <item.icon className="w-4 h-4 text-primary" />
                        <p className="text-base font-bold">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button size="lg" className="w-full glow-green" onClick={() => setBookingOpen(true)}>
                  Voir les créneaux <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Section>

        {/* ─── Pricing ─── */}
        <Section id="pricing" className="py-20 sm:py-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Tarifs transparents</p>
              <h2 className="text-2xl sm:text-3xl font-bold">Un prix, pas de surprise</h2>
              <button onClick={() => navigateTo('pricing')} className="mt-3 text-sm text-primary hover:underline inline-flex items-center gap-1">
                Voir tous les tarifs <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <motion.div
                className="bg-card border border-border rounded-2xl p-6 sm:p-8 text-center"
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                initial={{ opacity: 0, y: 20 }}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">1 heure</h3>
                <p className="text-3xl font-extrabold text-primary">
                  25 000 <span className="text-base font-normal text-muted-foreground">FCFA</span>
                </p>
                <p className="text-sm text-muted-foreground mt-2">Jusqu&rsquo;à 14 joueurs</p>
              </motion.div>
              <motion.div
                className="bg-card border border-primary/30 rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden"
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                initial={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.1 }}
              >
                <div className="absolute top-3 right-3">
                  <Badge className="bg-primary text-primary-foreground text-xs">Populaire</Badge>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Acompte</h3>
                <p className="text-3xl font-extrabold text-primary">
                  5 000 <span className="text-base font-normal text-muted-foreground">FCFA</span>
                </p>
                <p className="text-sm text-muted-foreground mt-2">Le reste sur place</p>
              </motion.div>
            </div>
          </div>
        </Section>

        {/* ─── CTA ─── */}
        <Section className="py-20 sm:py-28 bg-secondary/30">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Prêt à jouer ?</h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-md mx-auto">
              Sélectionnez votre créneau — seul votre numéro suffit.
            </p>
            <Button size="lg" className="text-lg px-10 py-6 glow-green" onClick={() => setBookingOpen(true)}>
              <Zap className="w-5 h-5 mr-2" /> Réserver maintenant
            </Button>
          </div>
        </Section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="ZalFoot" width={36} height={36} className="rounded-lg" />
            <span className="text-sm font-semibold"><span className="text-primary">Zal</span>Foot</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ZalFoot — Réservation de terrains, Sénégal
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {FOOTER_LINKS.map((link) => (
              <button key={link.label} onClick={() => navigateTo(link.view)} className="hover:text-foreground transition-colors">
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
