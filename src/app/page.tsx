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
  CreditCard,
  Zap,
  ChevronDown,
  CalendarDays,
  ShieldCheck,
  ArrowRight,
  Menu,
  X,
  LayoutDashboard,
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import Dashboard from '@/components/dashboard';

/* ───────────── Types ───────────── */
interface TimeSlot {
  id: string;
  time: string;
  label: string;
  available: boolean;
  price: number;
}

/* ───────────── Constants ───────────── */
const NAV_LINKS = [
  { label: 'Terrains', href: '#terrains' },
  { label: 'Comment ça marche', href: '#steps' },
  { label: 'Tarifs', href: '#pricing' },
];

const STATS = [
  { value: 1250, suffix: '+', label: 'Matchs joués' },
  { value: 98, suffix: '%', label: 'Satisfaction' },
  { value: 14, suffix: '', label: 'Joueurs max' },
];

const STEPS = [
  {
    icon: CalendarDays,
    emoji: '📅',
    number: '01',
    title: 'Choisissez',
    description:
      'Parcourez les créneaux disponibles. Sélectionnez votre date et heure sans créer de compte.',
  },
  {
    icon: ShieldCheck,
    emoji: '🔐',
    number: '02',
    title: 'Connectez-vous',
    description:
      'Créez un compte en 30 secondes ou connectez-vous pour confirmer votre réservation.',
  },
  {
    icon: CreditCard,
    emoji: '💳',
    number: '03',
    title: 'Payez l\'acompte',
    description:
      'Réglez l\'acompte en ligne via Wave ou Orange Money. Le solde se paye sur place.',
  },
];

const VENUE = {
  name: 'ZalFoot Arena',
  location: '📍 Dakar, Sénégal',
  description:
    'Terrain synthétique dernière génération avec éclairage LED. Espace convivial avec vestiaires modernes et buvette.',
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

/* ───────────── Animated Counter ───────────── */
function AnimatedCounter({
  value,
  suffix,
  inView,
}: {
  value: number;
  suffix: string;
  inView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = Math.max(1, Math.floor(value / (duration / 16)));
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

/* ───────────── Section Wrapper ───────────── */
function Section({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      {children}
    </motion.section>
  );
}

/* ───────────── Booking Dialog ───────────── */
function BookingDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    addDays(new Date(), 1)
  );
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [step, setStep] = useState<'select' | 'info' | 'confirm'>('select');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loadingSlots, setLoadingSlots] = useState(false);

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
      fetchSlots(tomorrow);
    }
  }, [open, fetchSlots]);

  // Refetch slots when date changes
  useEffect(() => {
    if (open && selectedDate) {
      setSelectedSlot(null);
      fetchSlots(selectedDate);
    }
  }, [selectedDate, open, fetchSlots]);

  const availableSlots = selectedDate ? slots : [];

  const handleConfirm = useCallback(async () => {
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
        setStep('confirm');
      }
    } catch {
      // silent
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedSlot, selectedDate, name, phone]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[90vh] overflow-hidden flex flex-col p-0">
        {step === 'confirm' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl">
                Réservation confirmée !
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-base mt-2">
                Votre créneau a été réservé avec succès. Vous recevrez un
                SMS de confirmation.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-secondary rounded-xl p-4 mt-4 w-full max-w-sm space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {selectedDate &&
                    format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Créneau</span>
                <span className="font-medium">{selectedSlot?.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Acompte</span>
                <span className="font-medium text-primary">5 000 FCFA</span>
              </div>
            </div>
            <Button
              className="mt-4 w-full max-w-sm"
              onClick={() => onOpenChange(false)}
            >
              Fermer
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-xl font-bold">
                Réserver un créneau
              </DialogTitle>
              <DialogDescription>
                {step === 'select'
                  ? 'Choisissez votre date et votre horaire'
                  : 'Complétez vos informations'}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full max-h-[60vh]">
                <div className="p-6 pt-2">
                  {step === 'select' && (
                    <div className="space-y-6">
                      {/* Calendar */}
                      <div>
                        <Label className="text-sm font-medium mb-3 block">
                          Date
                        </Label>
                        <div className="flex justify-center">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={{ before: new Date() }}
                            className="rounded-xl border border-border"
                            classNames={{
                              day_selected:
                                'bg-primary text-primary-foreground rounded-md',
                              day_today: 'bg-accent text-accent-foreground rounded-md',
                            }}
                          />
                        </div>
                      </div>

                      {/* Time Slots */}
                      {selectedDate && (
                        <div>
                          <Label className="text-sm font-medium mb-3 block">
                            Créneaux disponibles —{' '}
                            {format(selectedDate, 'EEEE d MMMM', {
                              locale: fr,
                            })}
                          </Label>
                          {loadingSlots ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {Array.from({ length: 8 }).map((_, i) => (
                                <div
                                  key={i}
                                  className="h-12 rounded-lg bg-secondary/50 animate-pulse"
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {availableSlots.map((slot) => (
                                <button
                                  key={slot.id}
                                  disabled={!slot.available}
                                  onClick={() => setSelectedSlot(slot)}
                                  className={`
                                    relative p-3 rounded-lg border text-sm font-medium transition-all
                                    ${
                                      !slot.available
                                        ? 'border-border/50 bg-secondary/30 text-muted-foreground/50 cursor-not-allowed line-through'
                                        : selectedSlot?.id === slot.id
                                          ? 'border-primary bg-primary/15 text-primary glow-green'
                                          : 'border-border bg-secondary/50 hover:border-primary/50 hover:bg-secondary'
                                    }
                                  `}
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
                        <Button
                          className="w-full"
                          size="lg"
                          onClick={() => setStep('info')}
                        >
                          Continuer
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}

                  {step === 'info' && (
                    <div className="space-y-4">
                      {/* Summary */}
                      <div className="bg-secondary rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Date</span>
                          <span className="font-medium">
                            {selectedDate &&
                              format(selectedDate, "EEEE d MMMM yyyy", {
                                locale: fr,
                              })}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Créneau</span>
                          <span className="font-medium">
                            {selectedSlot?.label}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Prix</span>
                          <span className="font-medium">
                            {VENUE.pricePerHour}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="name">Nom complet</Label>
                          <Input
                            id="name"
                            placeholder="Votre nom"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Téléphone</Label>
                          <Input
                            id="phone"
                            placeholder="+221 7X XXX XX XX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="mt-1.5"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setStep('select')}
                        >
                          Retour
                        </Button>
                        <Button
                          className="flex-1"
                          disabled={!name || !phone || isSubmitting}
                          onClick={handleConfirm}
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
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ───────────── Main Page ───────────── */
export default function HomePage() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Redirect to landing when switching back
  const handleBackToLanding = useCallback(() => {
    setView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true });

  // Show dashboard
  if (view === 'dashboard') {
    return <Dashboard onBack={handleBackToLanding} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Navbar ─── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/90 backdrop-blur-xl border-b border-border shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <Image
              src="/logo.png"
              alt="ZalFoot"
              width={36}
              height={36}
              className="rounded-md"
            />
            <span className="text-xl font-bold tracking-tight">
              <span className="text-primary">Zal</span>
              <span className="text-foreground">Foot</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="w-px h-4 bg-border" />
            <button
              onClick={() => setView('dashboard')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </button>
            <Button
              size="sm"
              className="glow-green"
              onClick={() => setBookingOpen(true)}
            >
              <Zap className="w-4 h-4 mr-1.5" />
              Réserver
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
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
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </a>
                ))}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setView('dashboard');
                  }}
                  className="flex items-center gap-1.5 py-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </button>
                <Button
                  className="w-full glow-green"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setBookingOpen(true);
                  }}
                >
                  <Zap className="w-4 h-4 mr-1.5" />
                  Réserver maintenant
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        {/* ─── Hero ─── */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/hero-bg.png"
              alt="Terrain de football"
              fill
              className="object-cover"
              priority
              quality={85}
            />
            <div className="hero-overlay absolute inset-0" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-20">
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-1.5 text-sm border border-primary/20 bg-primary/10"
            >
              <MapPin className="w-3.5 h-3.5 mr-1.5" />
              DAKAR · SÉNÉGAL
            </Badge>

            <motion.h1
              className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              Le match
              <br />
              <span className="text-primary">commence ici.</span>
            </motion.h1>

            <motion.p
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Réservez votre terrain en 30 secondes.
              <br className="hidden sm:block" />
              Aucun compte requis pour consulter les disponibilités.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-10"
            >
              <Button
                size="lg"
                className="text-lg px-8 py-6 glow-green"
                onClick={() => setBookingOpen(true)}
              >
                <Zap className="w-5 h-5 mr-2" />
                Réserver maintenant
              </Button>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              className="absolute bottom-8 left-1/2 -translate-x-1/2 bounce-down"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <ChevronDown className="w-6 h-6 text-muted-foreground" />
            </motion.div>
          </div>
        </section>

        {/* ─── Stats ─── */}
        <section
          ref={statsRef}
          className="relative z-10 -mt-16 sm:-mt-20"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="bg-card/80 backdrop-blur-lg border border-border rounded-2xl p-6 text-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={statsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                >
                  <div className="text-3xl sm:text-4xl font-extrabold text-primary">
                    <AnimatedCounter
                      value={stat.value}
                      suffix={stat.suffix}
                      inView={statsInView}
                    />
                  </div>
                  <div className="mt-1.5 text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <Section id="steps" className="py-24 sm:py-32">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
                Simple & rapide
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold">
                En 3 étapes c&rsquo;est joué
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.number}
                  className="step-card bg-card rounded-2xl p-6 sm:p-8"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{step.emoji}</span>
                    <span className="text-4xl font-black text-primary/15">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ─── Venue Section ─── */}
        <Section id="terrains" className="py-24 sm:py-32 bg-secondary/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 text-center">
              Le terrain
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              {VENUE.name}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Image */}
              <div className="relative rounded-2xl overflow-hidden aspect-video">
                <Image
                  src="/terrain.png"
                  alt={VENUE.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              </div>

              {/* Details */}
              <div className="space-y-6">
                <div>
                  <p className="text-muted-foreground">{VENUE.location}</p>
                  <p className="text-muted-foreground mt-3 leading-relaxed">
                    {VENUE.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card rounded-xl p-4 border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Prix / heure
                    </p>
                    <p className="text-xl font-bold text-primary">
                      {VENUE.pricePerHour}
                    </p>
                  </div>
                  <div className="bg-card rounded-xl p-4 border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Acompte
                    </p>
                    <p className="text-xl font-bold text-primary">
                      {VENUE.deposit}
                    </p>
                  </div>
                  <div className="bg-card rounded-xl p-4 border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Capacité
                    </p>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <p className="text-xl font-bold">
                        {VENUE.capacity}
                      </p>
                    </div>
                  </div>
                  <div className="bg-card rounded-xl p-4 border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Horaires
                    </p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <p className="text-xl font-bold">{VENUE.hours}</p>
                    </div>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full glow-green"
                  onClick={() => setBookingOpen(true)}
                >
                  Voir les créneaux
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Section>

        {/* ─── Pricing Section ─── */}
        <Section id="pricing" className="py-24 sm:py-32">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
                Tarifs transparents
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Un prix, pas de surprise
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                  25 000{' '}
                  <span className="text-base font-normal text-muted-foreground">
                    FCFA
                  </span>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Jusqu&rsquo;à 14 joueurs
                </p>
              </motion.div>

              <motion.div
                className="bg-card border border-primary/30 rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden"
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                initial={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.1 }}
              >
                <div className="absolute top-3 right-3">
                  <Badge className="bg-primary text-primary-foreground text-xs">
                    Populaire
                  </Badge>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Acompte</h3>
                <p className="text-3xl font-extrabold text-primary">
                  5 000{' '}
                  <span className="text-base font-normal text-muted-foreground">
                    FCFA
                  </span>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Le reste sur place
                </p>
              </motion.div>
            </div>
          </div>
        </Section>

        {/* ─── CTA Section ─── */}
        <Section className="py-24 sm:py-32 bg-secondary/30">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Prêt à jouer ?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Sélectionnez un terrain, choisissez votre créneau — seul votre
              numéro suffit.
            </p>
            <Button
              size="lg"
              className="text-lg px-10 py-6 glow-green"
              onClick={() => setBookingOpen(true)}
            >
              <Zap className="w-5 h-5 mr-2" />
              Réserver maintenant
            </Button>
          </div>
        </Section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="ZalFoot"
              width={24}
              height={24}
              className="rounded"
            />
            <span className="text-sm font-semibold">
              <span className="text-primary">Zal</span>Foot
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ZalFoot — Réservation de terrains de
            football
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Mentions légales
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>

      {/* ─── Booking Dialog ─── */}
      <BookingDialog open={bookingOpen} onOpenChange={setBookingOpen} />
    </div>
  );
}
