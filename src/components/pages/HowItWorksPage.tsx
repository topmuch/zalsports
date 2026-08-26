'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
  CalendarDays,
  ShieldCheck,
  CreditCard,
  Smartphone,
  MapPin,
  Bell,
  CheckCircle2,
  Clock,
  Users,
  Zap,
  ArrowRight,
} from 'lucide-react';
import PageLayout from './PageLayout';

const MAIN_STEPS = [
  {
    icon: CalendarDays,
    number: '01',
    title: 'Choisissez votre créneau',
    description:
      'Consultez le calendrier en temps réel pour voir les disponibilités. Sélectionnez la date et l\'horaire qui vous conviennent le mieux.',
    details: ['Calendrier interactif', 'Créneaux de 8h à minuit', 'Mise à jour en temps réel'],
  },
  {
    icon: Smartphone,
    number: '02',
    title: 'Réservez en 30 secondes',
    description:
      'Entrez simplement votre nom et numéro de téléphone. Aucun compte à créer, aucune application à télécharger.',
    details: ['Aucun compte requis', 'Nom + téléphone suffisent', 'Confirmation instantanée'],
  },
  {
    icon: CreditCard,
    number: '03',
    title: 'Payez l\'acompte',
    description:
      'Réglez l\'acompte de 5 000 FCFA via Wave ou Orange Money directement depuis votre téléphone.',
    details: ['Wave & Orange Money', 'Acompte : 5 000 FCFA', 'Solde sur place'],
  },
  {
    icon: Bell,
    number: '04',
    title: 'Recevez la confirmation',
    description:
      'Un SMS de confirmation vous est envoyé avec tous les détails de votre réservation.',
    details: ['SMS automatique', 'Détails complets', 'Rappel 2h avant'],
  },
];

const FAQ = [
  {
    q: 'Puis-je réserver pour plusieurs heures ?',
    a: 'Oui, vous pouvez réserver plusieurs créneaux consécutifs. Chaque heure supplémentaire coûte 25 000 FCFA.',
  },
  {
    q: 'Comment annuler une réservation ?',
    a: 'Contactez-nous par téléphone ou WhatsApp au moins 2 heures avant votre créneau. L\'acompte est remboursable si l\'annulation est faite à temps.',
  },
  {
    q: 'Le terrain est-il éclairé le soir ?',
    a: 'Oui, le terrain dispose d\'un éclairage LED professionnel. Vous pouvez jouer jusqu\'à minuit sans problème.',
  },
  {
    q: 'Combien de joueurs peuvent jouer ?',
    a: 'Le terrain peut accueillir jusqu\'à 14 joueurs (7 contre 7). C\'est le format idéal pour un match amical ou un tournoi.',
  },
  {
    q: 'Y a-t-il des vestiaires ?',
    a: 'Oui, des vestiaires modernes avec douches sont à votre disposition gratuitement avec chaque réservation.',
  },
  {
    q: 'Puis-je réserver pour un tournoi ?',
    a: 'Absolument ! Contactez-nous pour les réservations de demi-journée ou journée complète avec un tarif spécial.',
  },
];

const FEATURES = [
  { icon: Clock, label: 'Ouvert 7j/7' },
  { icon: MapPin, label: 'Croisement Kaolack - Mbour, Sénégal' },
  { icon: Users, label: 'Jusqu\'à 14 joueurs' },
  { icon: Zap, label: 'Réservation en 30s' },
  { icon: CheckCircle2, label: 'Paiement mobile' },
  { icon: ShieldCheck, label: 'Aucun compte requis' },
];

export default function HowItWorksPage({ onBack }: { onBack: () => void }) {
  return (
    <PageLayout
      title="Comment ça marche"
      subtitle="Réservez votre terrain de football en quelques secondes, directement depuis votre téléphone."
      onBack={onBack}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20">

        {/* ─── Features Badges ─── */}
        <div className="flex flex-wrap gap-2 justify-center">
          {FEATURES.map((f) => (
            <Badge key={f.label} variant="secondary" className="px-3 py-1.5 gap-1.5">
              <f.icon className="w-3.5 h-3.5 text-primary" /> {f.label}
            </Badge>
          ))}
        </div>

        {/* ─── Main Steps ─── */}
        <div>
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Processus simple</p>
            <h2 className="text-2xl sm:text-3xl font-bold">4 étapes pour réserver</h2>
          </div>
          <div className="space-y-6">
            {MAIN_STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                {/* Left: number + icon */}
                <div className="flex items-center gap-4 sm:min-w-[180px]">
                  <span className="text-4xl font-black text-primary/15">{step.number}</span>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>

                {/* Right: content */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{step.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {step.details.map((d) => (
                      <span key={d} className="flex items-center gap-1.5 text-xs bg-secondary rounded-lg px-3 py-1.5">
                        <CheckCircle2 className="w-3 h-3 text-primary" /> {d}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Connector line (except last) */}
                {i < MAIN_STEPS.length - 1 && (
                  <div className="hidden sm:block absolute left-[90px] top-full w-px h-6 bg-border" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* ─── Payment Section ─── */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Paiement</p>
            <h2 className="text-2xl font-bold">Moyens de paiement acceptés</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: 'Wave', desc: 'Payez directement depuis votre compte Wave', color: 'from-sky-500/10 to-sky-600/5' },
              { name: 'Orange Money', desc: 'Transférez via votre portefeuille Orange Money', color: 'from-orange-500/10 to-orange-600/5' },
              { name: 'Espèces', desc: 'Payez le solde sur place en espèces', color: 'from-emerald-500/10 to-emerald-600/5' },
            ].map((p) => (
              <div key={p.name} className={`bg-gradient-to-br ${p.color} rounded-xl p-5 border border-border`}>
                <div className="w-10 h-10 rounded-lg bg-background/80 flex items-center justify-center mb-3">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-sm mb-1">{p.name}</h3>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── FAQ ─── */}
        <div>
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-2xl sm:text-3xl font-bold">Questions fréquentes</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FAQ.map((item, i) => (
              <motion.div
                key={i}
                className="bg-card border border-border rounded-xl p-5"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <h4 className="font-semibold text-sm mb-2 flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  {item.q}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed pl-6">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
