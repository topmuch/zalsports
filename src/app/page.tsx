'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  Check,
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
import CalendarPage from '@/components/pages/CalendarPage';
import BookingPage from '@/components/pages/BookingPage';

/* ═══════════════════════════════════════════
   Types & Constants
   ═══════════════════════════════════════════ */

type PageView = 'landing' | 'booking' | 'dashboard' | 'user' | 'contact' | 'how-it-works' | 'pricing' | 'concept' | 'about' | 'privacy' | 'calendar';

const NAV_LINKS = [
  { label: 'Terrain', href: '#terrains' },
  { label: 'Calendrier', view: 'calendar' as PageView },
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
   Main Page
   ═══════════════════════════════════════════ */

export default function HomePage() {
  const [view, setView] = useState<PageView>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  if (view === 'booking') {
    return <BookingPage onBack={handleBackToLanding} />;
  }
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
    return <PricingPage onBack={handleBackToLanding} onBook={() => navigateTo('booking')} />;
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
  if (view === 'calendar') {
    return <CalendarPage onBack={handleBackToLanding} />;
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
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
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
            <Button size="sm" className="glow-green" onClick={() => navigateTo('booking')}>
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
                    navigateTo('booking');
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

        {/* ═══════ 2. HERO SECTION (terrain bg, dark overlay) ═══════ */}
        <section className="relative min-h-[520px] sm:min-h-[580px] lg:min-h-[640px] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/hero-bg.png"
              alt="Terrain de football"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/80" />
          </div>
          <div className="relative z-[2] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center w-full">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm font-medium border-white/30 text-white bg-white/10">⚽ Football · Sénégal</Badge>
            </motion.div>
            <motion.h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight leading-[1.15] text-white max-w-3xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
              Réservez votre terrain de football <span className="text-green-400">en 30 secondes</span>
            </motion.h1>
            <motion.p className="mt-5 text-base sm:text-lg text-white/80 max-w-xl mx-auto leading-relaxed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              Terrain synthétique, éclairage LED, vestiaires. Aucun compte requis.
            </motion.p>
            <motion.div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
              <Button size="lg" className="text-base px-8 glow-green" onClick={() => navigateTo('booking')}>
                <Zap className="w-4 h-4 mr-2" /> Réserver maintenant
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 border-white/40 text-white bg-transparent hover:bg-white/10 hover:text-white" onClick={() => navigateTo('how-it-works')}>
                Comment ça marche
              </Button>
            </motion.div>
            <motion.div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
              {HERO_STATS.map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-2 text-sm text-white/80">
                  <stat.icon className="w-4 h-4 text-green-400" />
                  <span>{stat.label}</span>
                  {i < HERO_STATS.length - 1 && <span className="hidden sm:inline text-white/30 mx-1">|</span>}
                </div>
              ))}
            </motion.div>
            <motion.div className="mt-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
              <Badge variant="secondary" className="px-4 py-2 text-sm font-normal gap-1.5 bg-white/10 text-white border border-white/20 hover:bg-white/20">
                <MapPin className="w-3.5 h-3.5 text-green-400" /> Croisement Kaolack - Mbour
              </Badge>
            </motion.div>
          </div>
        </section>

        {/* ═══════ 3. QUICK SEARCH BAR ═══════ */}
        <section className="bg-white pb-16 sm:pb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <Button className="w-full sm:w-auto" size="lg" onClick={() => navigateTo('booking')}>
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════ 4. STATS BANNER (green bg) ═══════ */}
        <section ref={bannerStatsRef} className="bg-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <Button size="lg" className="w-full glow-green mt-2" onClick={() => navigateTo('booking')}>
                  Voir les créneaux
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Section>

        {/* ═══════ 8. PRICING SECTION ═══════ */}
        <Section id="pricing" className="py-16 sm:py-24 bg-secondary/40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Prêt à jouer ?
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-md mx-auto">
              Réservez votre créneau dès maintenant
            </p>
            <Button size="lg" className="text-base px-10 py-6 glow-green" onClick={() => navigateTo('booking')}>
              <Zap className="w-5 h-5 mr-2" />
              Réserver maintenant
            </Button>
          </div>
        </Section>
      </main>

      {/* ═══════ 11. FOOTER (sticky, mt-auto) ═══════ */}
      <footer className="border-t border-border py-8 mt-auto bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
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
    </div>
  );
}
