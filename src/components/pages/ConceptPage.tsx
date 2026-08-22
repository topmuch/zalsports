'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Zap,
  Users,
  Clock,
  ShieldCheck,
  Target,
  Heart,
  TrendingUp,
  Smartphone,
  MapPin,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import PageLayout from './PageLayout';

const PROBLEM = [
  'Appels téléphoniques qui ne passent pas',
  'Pas de visibilité sur les disponibilités',
  'Paiements en espèces uniquement',
  'Aucune confirmation officielle',
  'Temps perdu à organiser un simple match',
];

const SOLUTION = [
  {
    icon: Smartphone,
    title: 'Réservation mobile',
    desc: 'Réservez depuis votre téléphone en 30 secondes. Pas besoin d\'appeler, pas d\'attente.',
  },
  {
    icon: Clock,
    title: 'Disponibilité en temps réel',
    desc: 'Le calendrier affiche les créneaux libres et réservés en temps réel. Plus de surprise.',
  },
  {
    icon: ShieldCheck,
    title: 'Paiement mobile money',
    desc: 'Payez l\'acompte via Wave ou Orange Money. Le solde sur place. Simple et sécurisé.',
  },
  {
    icon: Zap,
    title: 'Confirmation instantanée',
    desc: 'SMS de confirmation immédiat avec tous les détails. Rappel automatique 2h avant.',
  },
];

const VALUES = [
  {
    icon: Target,
    title: 'Simplicité',
    desc: 'Un processus en 3 étapes. Pas de compte, pas d\'application. Juste votre nom et votre numéro.',
  },
  {
    icon: Heart,
    title: 'Accessibilité',
    desc: 'Un prix unique et transparent. Pas de frais cachés. Le football doit être accessible à tous.',
  },
  {
    icon: TrendingUp,
    title: 'Modernité',
    desc: 'Terrain synthétique dernière génération, éclairage LED, vestiaires modernes. Le meilleur pour jouer.',
  },
  {
    icon: Users,
    title: 'Communauté',
    desc: 'ZalFoot connecte les joueurs de Kaolack-Mbour. Créez votre équipe, organisez vos matchs, vivez votre passion.',
  },
];

const IMPACT = [
  { value: '1 250+', label: 'Matchs joués', desc: 'Depuis le lancement de ZalFoot' },
  { value: '98%', label: 'Satisfaction', desc: 'Taux de satisfaction client' },
  { value: '500+', label: 'Joueurs actifs', desc: 'Utilisateurs réguliers' },
  { value: '< 30s', label: 'Temps de réservation', desc: 'Du choix à la confirmation' },
];

export default function ConceptPage({ onBack }: { onBack: () => void }) {
  return (
    <PageLayout
      title="Le concept ZalFoot"
      subtitle="Révolutionner la réservation de terrains de football au Sénégal. Simple, rapide, moderne."
      onBack={onBack}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20">

        {/* ─── Intro ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">Notre vision</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Le football mérite mieux qu&rsquo;un coup de fil.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Au Sénégal, réserver un terrain de football est souvent un calvaire : appels qui ne répondent pas, pas de visibilité sur les disponibilités, aucun moyen de paiement moderne. ZalFoot change ça.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Notre plateforme permet à n\'importe quel joueur de réserver un terrain de qualité en quelques secondes, depuis son téléphone, avec une confirmation immédiate. C\'est aussi simple que commander un repas.
            </p>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
            <Image src="/terrain.png" alt="Terrain ZalFoot" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-background/70 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium">Croisement Kaolack - Mbour, Sénégal</span>
            </div>
          </div>
        </div>

        {/* ─── Problem / Solution ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Before */}
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                <span className="text-lg">😤</span>
              </div>
              <h3 className="text-lg font-bold">Avant ZalFoot</h3>
            </div>
            <ul className="space-y-3">
              {PROBLEM.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-destructive" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* After */}
          <div className="bg-card border border-primary/20 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-lg">⚡</span>
              </div>
              <h3 className="text-lg font-bold">Avec ZalFoot</h3>
            </div>
            <div className="space-y-4">
              {SOLUTION.map((s) => (
                <div key={s.title} className="flex gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <s.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{s.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Values ─── */}
        <div>
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Nos valeurs</p>
            <h2 className="text-2xl sm:text-3xl font-bold">Ce qui nous anime</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                className="bg-card border border-border rounded-xl p-5 sm:p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <v.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ─── Impact ─── */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Impact</p>
            <h2 className="text-2xl font-bold">ZalFoot en chiffres</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {IMPACT.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <p className="text-2xl sm:text-3xl font-extrabold text-primary">{stat.value}</p>
                <p className="text-sm font-semibold mt-1">{stat.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{stat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ─── CTA ─── */}
        <div className="text-center bg-primary/5 border border-primary/20 rounded-2xl p-8 sm:p-10">
          <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Prêt à essayer ?</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Réservez votre premier créneau maintenant et découvrez la différence ZalFoot.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
