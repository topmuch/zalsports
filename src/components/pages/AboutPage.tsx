'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Trophy,
  Target,
  Heart,
  Users,
  MapPin,
  Star,
  Award,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import PageLayout from './PageLayout';

const TEAM = [
  {
    name: 'Mamadou Diop',
    role: 'Fondateur & CEO',
    desc: 'Passionné de football et de tech. Ancien joueur amateur qui a vécu la galère de la réservation.',
  },
  {
    name: 'Aminata Fall',
    role: 'Directrice des opérations',
    desc: 'Experte en gestion de sites sportifs. Elle veille à ce que chaque match se déroule parfaitement.',
  },
  {
    name: 'Ibrahima Ndiaye',
    role: 'CTO',
    desc: 'Développeur full-stack sénégalais. Il a construit la plateforme de A à Z.',
  },
];

const MILESTONES = [
  { year: '2023', title: 'Lancement', desc: 'ZalFoot voit le jour au Croisement Kaolack-Mbour avec un seul terrain.' },
  { year: '2023', title: '500 matchs', desc: '500 matchs joués en seulement 6 mois.' },
  { year: '2024', title: '1 000+ matchs', desc: 'Cap des 1 000 matchs franchi avec un taux de satisfaction de 98%.' },
  { year: '2024', title: 'Mobile Money', desc: 'Intégration de Wave et Orange Money pour les paiements.' },
  { year: '2025', title: 'Expansion', desc: 'Objectif : 5 terrains au Sénégal.' },
];

const MISSION_ITEMS = [
  {
    icon: Target,
    title: 'Notre mission',
    desc: 'Démocratiser l\'accès au football de qualité au Sénégal en rendant la réservation de terrain aussi simple qu\'un clic.',
  },
  {
    icon: Heart,
    title: 'Notre passion',
    desc: 'Le football n\'est pas juste un sport au Sénégal, c\'est une culture. ZalFoot célèbre cette passion chaque jour.',
  },
  {
    icon: TrendingUp,
    title: 'Notre ambition',
    desc: 'Devenir la plateforme de référence pour la réservation de terrains sportifs en Afrique de l\'Ouest.',
  },
];

export default function AboutPage({ onBack }: { onBack: () => void }) {
  return (
    <PageLayout
      title="À propos de nous"
      subtitle="L'histoire de ZalFoot, une équipe passionnée qui veut changer la façon de jouer au football au Sénégal."
      onBack={onBack}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20">

        {/* ─── Mission ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {MISSION_ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              className="bg-card border border-border rounded-xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* ─── Story ─── */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">Notre histoire</span>
          </div>
          <h2 className="text-2xl font-bold mb-4">De l\'idée à la réalité</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed max-w-3xl">
            <p>
              ZalFoot est né d\'une frustration simple : organiser un match de foot entre amis au Sénégal ne devrait pas être aussi compliqué. Appels qui ne répondent pas, pas de visibilité sur les créneaux disponibles, et un système de réservation qui repose encore sur le bon vieux carnet papier.
            </p>
            <p>
              En 2023, notre fondateur Mamadou Diop a décidé de changer ça. Ancien joueur amateur, il connaissait parfaitement la galère. Fort de son expérience en tech, il a conçu une plateforme ultra-simple : pas de compte à créer, pas d\'application à télécharger, juste un calendrier en ligne et un numéro de téléphone.
            </p>
            <p>
              Aujourd\'hui, ZalFoot gère un terrain synthétique dernier cri au Croisement Kaolack-Mbour, avec plus de 1 250 matchs joués et un taux de satisfaction de 98%. Et ce n\'est que le début.
            </p>
          </div>
        </div>

        {/* ─── Timeline ─── */}
        <div>
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Parcours</p>
            <h2 className="text-2xl sm:text-3xl font-bold">Nos étapes clés</h2>
          </div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-border sm:-translate-x-px" />

            <div className="space-y-8">
              {MILESTONES.map((m, i) => (
                <motion.div
                  key={m.year + m.title}
                  className={`relative flex items-start gap-6 ${i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                >
                  {/* Dot */}
                  <div className="absolute left-4 sm:left-1/2 w-3 h-3 rounded-full bg-primary sm:-translate-x-1.5 mt-1.5 z-10" />

                  {/* Spacer on mobile */}
                  <div className="w-10 shrink-0" />

                  {/* Content */}
                  <div className={`flex-1 bg-card border border-border rounded-xl p-5 ${i % 2 === 0 ? 'sm:text-right' : 'sm:text-left'}`}>
                    <span className="text-xs font-bold text-primary">{m.year}</span>
                    <h4 className="font-semibold text-sm mt-1">{m.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
                  </div>

                  {/* Empty spacer for alignment */}
                  <div className="hidden sm:block flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Team ─── */}
        <div>
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">L'équipe</p>
            <h2 className="text-2xl sm:text-3xl font-bold">Les visages derrière ZalFoot</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TEAM.map((member, i) => (
              <motion.div
                key={member.name}
                className="bg-card border border-border rounded-xl p-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl">
                  👤
                </div>
                <h3 className="font-bold">{member.name}</h3>
                <p className="text-xs text-primary font-medium mt-0.5 mb-2">{member.role}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{member.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ─── Values Badges ─── */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 text-center">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Engagement</p>
          <h2 className="text-xl font-bold mb-6">Ce que nous garantissons</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: Star, label: 'Qualité du terrain' },
              { icon: Trophy, label: 'Service client 7j/7' },
              { icon: Award, label: 'Prix transparents' },
              { icon: MapPin, label: 'Emplacement stratégique' },
              { icon: Users, label: 'Communauté active' },
              { icon: Heart, label: 'Passion du football' },
            ].map((v) => (
              <div
                key={v.label}
                className="flex items-center gap-2 bg-secondary rounded-lg px-4 py-2.5 border border-border"
              >
                <v.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{v.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
