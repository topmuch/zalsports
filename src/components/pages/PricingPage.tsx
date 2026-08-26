'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Zap,
  Users,
  ShieldCheck,
  Star,
  CheckCircle2,
  X,
  Crown,
  Gift,
  Info,
} from 'lucide-react';
import PageLayout from './PageLayout';

const PLANS = [
  {
    name: '1 heure',
    price: 25_000,
    unit: 'FCFA',
    desc: 'Parfait pour un match rapide entre amis',
    icon: Clock,
    popular: false,
    features: [
      'Terrain synthétique professionnel',
      'Éclairage LED inclus',
      'Vestiaires + douches',
      'Jusqu\'à 14 joueurs',
      'Ballons disponibles',
    ],
    notIncluded: [],
  },
  {
    name: '2 heures',
    price: 45_000,
    unit: 'FCFA',
    desc: 'Idéal pour un tournoi ou un entraînement complet',
    icon: Zap,
    popular: true,
    features: [
      'Tout ce qui est inclus dans 1 heure',
      '5 000 FCFA d\'économie',
      'Pause de 5 min entre les heures',
      'Eau minérale incluse',
      'Priorité de réservation',
    ],
    notIncluded: [],
  },
  {
    name: 'Demi-journée',
    price: 80_000,
    unit: 'FCFA',
    desc: '4 heures pour organiser un mini-tournoi',
    icon: Crown,
    popular: false,
    features: [
      'Tout ce qui est inclus dans 2 heures',
      '20 000 FCFA d\'économie',
      'Arbitre disponible sur demande',
      'Buvette à prix réduit',
      'Parking gratuit',
    ],
    notIncluded: [],
  },
];

const EXTRAS = [
  { name: 'Arbitre', price: '5 000 FCFA', desc: 'Arbitre certifié pour votre match' },
  { name: 'Ballons', price: 'Inclus', desc: 'Ballons de qualité professionnelle' },
  { name: 'Gilets', price: 'Inclus', desc: 'Gilets de couleurs différentes' },
  { name: 'Buvette', price: 'Sur place', desc: 'Boissons et collations disponibles' },
  { name: 'Vestiaires', price: 'Inclus', desc: 'Vestiaires avec douches et casiers' },
  { name: 'Parking', price: 'Inclus', desc: 'Parking sécurisé gratuit' },
];

const PAYMENT_INFO = [
  { label: 'Acompte en ligne', value: '5 000 FCFA', desc: 'Via Wave ou Orange Money' },
  { label: 'Solde sur place', value: '20 000 FCFA', desc: 'En espèces ou mobile money' },
  { label: 'Annulation gratuite', value: '2h avant', desc: 'Remboursement intégral de l\'acompte' },
];

export default function PricingPage({ onBack, onBook }: { onBack: () => void; onBook: () => void }) {
  return (
    <PageLayout
      title="Tarifs"
      subtitle="Des prix simples et transparents. Pas de frais cachés, pas de mauvaise surprise."
      onBack={onBack}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">

        {/* ─── Plans ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`relative bg-card border rounded-2xl p-6 sm:p-8 flex flex-col ${
                plan.popular
                  ? 'border-primary/40 shadow-[0_0_40px_oklch(0.55_0.19_145/0.15)]'
                  : 'border-border'
              }`}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground text-xs shadow-lg glow-green">
                    <Star className="w-3 h-3 mr-1" /> Populaire
                  </Badge>
                </div>
              )}

              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <plan.icon className="w-6 h-6 text-primary" />
              </div>

              <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-5">{plan.desc}</p>

              <div className="mb-6">
                <span className="text-3xl font-extrabold text-primary">
                  {plan.price.toLocaleString('fr-FR')}
                </span>
                <span className="text-sm text-muted-foreground ml-1">{plan.unit}</span>
              </div>

              <div className="flex-1 space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </div>
                ))}
                {plan.notIncluded.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <X className="w-4 h-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground/40">{f}</span>
                  </div>
                ))}
              </div>

              <Button
                className={`w-full ${plan.popular ? 'glow-green' : ''}`}
                variant={plan.popular ? 'default' : 'outline'}
                size="lg"
                onClick={onBook}
              >
                Réserver
              </Button>
            </motion.div>
          ))}
        </div>

        {/* ─── Payment Info ─── */}
        <div>
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Paiement</p>
            <h2 className="text-2xl font-bold">Comment ça se passe ?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PAYMENT_INFO.map((p) => (
              <div key={p.label} className="bg-card border border-border rounded-xl p-5 text-center">
                <p className="text-2xl font-extrabold text-primary mb-1">{p.value}</p>
                <p className="text-sm font-semibold mb-1">{p.label}</p>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Extras ─── */}
        <div>
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Inclus & Extras</p>
            <h2 className="text-2xl font-bold">Tout est prévu</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {EXTRAS.map((e) => (
              <div key={e.name} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold">{e.name}</p>
                  <Badge variant="secondary" className="text-[10px]">
                    {e.price === 'Inclus' ? (
                      <CheckCircle2 className="w-3 h-3 mr-1 text-primary" />
                    ) : (
                      <Gift className="w-3 h-3 mr-1" />
                    )}
                    {e.price}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{e.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Info Banner ─── */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex items-start gap-4">
          <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-sm mb-1">Bon à savoir</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tous les prix sont TTC. L\'acompte de 5 000 FCFA est déductible du montant total. En cas d\'annulation moins de 2 heures avant le créneau, l\'acompte n\'est pas remboursable. Les tarifs demi-journée et journée complète sont disponibles sur demande via notre page contact.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
