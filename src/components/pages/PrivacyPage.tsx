'use client';

import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  Eye,
  Database,
  Bell,
  Trash2,
  Mail,
  Phone,
  FileText,
} from 'lucide-react';
import PageLayout from './PageLayout';

const SECTIONS = [
  {
    icon: Database,
    title: '1. Données collectées',
    content: `Nous collectons uniquement les données nécessaires au bon fonctionnement du service de réservation :

• **Nom complet** — pour identifier votre réservation et personnaliser votre expérience.
• **Numéro de téléphone** — pour vous envoyer les confirmations et rappels par SMS.
• **Données de réservation** — date, heure et statut de vos réservations.

Nous ne collectons **aucune donnée de paiement** directement. Les paiements sont traités par des opérateurs tiers (Wave, Orange Money) conformément à leurs propres politiques de confidentialité.`,
  },
  {
    icon: Eye,
    title: '2. Utilisation des données',
    content: `Vos données sont utilisées exclusivement pour :

• Confirmer vos réservations par SMS
• Vous envoyer des rappels avant votre créneau
• Améliorer notre service (statistiques anonymisées)
• Vous contacter en cas de problème lié à votre réservation

Vos données ne sont **jamais vendues, louées ou partagées** avec des tiers à des fins commerciales.`,
  },
  {
    icon: Shield,
    title: '3. Protection des données',
    content: `Nous prenons la protection de vos données au sérieux :

• Toutes les communications sont chiffrées (HTTPS/SSL)
• Les données sont stockées sur des serveurs sécurisés
• L'accès aux données est strictement limité à l'équipe ZalFoot
• Nous ne conservons pas vos données de carte bancaire

ZalFoot est conforme aux réglementations locales en matière de protection des données personnelles.`,
  },
  {
    icon: Bell,
    title: '4. Communications',
    content: `Nous pouvons vous envoyer :

• **SMS de confirmation** — après chaque réservation
• **Rappels** — 2 heures avant votre créneau
• **Notifications de changement** — en cas de modification ou annulation

Vous pouvez à tout moment demander à ne plus recevoir de communications en nous contactant directement.`,
  },
  {
    icon: Trash2,
    title: '5. Suppression des données',
    content: `Vous avez le droit de demander la suppression de vos données à tout moment. Pour cela :

• Contactez-nous par téléphone au **78 278 49 49**
• Ou par email à **contact@zalfoot.sn**

Les données de réservation sont automatiquement supprimées après **12 mois** d'inactivité sur votre numéro.`,
  },
  {
    icon: Lock,
    title: '6. Cookies',
    content: `ZalFoot utilise un nombre minimal de cookies :

• **Cookies essentiels** — nécessaires au fonctionnement du site (session, préférences)
• **Cookies analytiques** — pour comprendre comment vous utilisez le site (anonymisés)

Nous n'utilisons **aucun cookie publicitaire** ni de pistage tiers.`,
  },
];

const RIGHTS = [
  { icon: Eye, label: 'Droit d\'accès', desc: 'Accédez à vos données personnelles' },
  { icon: FileText, label: 'Droit de rectification', desc: 'Modifiez vos informations' },
  { icon: Trash2, label: 'Droit d\'effacement', desc: 'Demandez la suppression de vos données' },
  { icon: Mail, label: 'Droit d\'opposition', desc: 'Refusez certaines communications' },
  { icon: Phone, label: 'Droit de portabilité', desc: 'Recevez vos données dans un format lisible' },
];

export default function PrivacyPage({ onBack }: { onBack: () => void }) {
  return (
    <PageLayout
      title="Politique de confidentialité"
      subtitle="Nous prenons la protection de vos données personnelles très au sérieux."
      onBack={onBack}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">

        {/* ─── Last updated ─── */}
        <p className="text-xs text-muted-foreground">Dernière mise à jour : Janvier 2025</p>

        {/* ─── Your Rights ─── */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">Vos droits</h2>
          <div className="space-y-3">
            {RIGHTS.map((r) => (
              <div key={r.label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <r.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Sections ─── */}
        {SECTIONS.map((section, i) => (
          <motion.section
            key={section.title}
            id={section.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <section.icon className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-lg font-bold">{section.title}</h2>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed pl-12 space-y-2">
              {section.content.split('\n').map((line, j) => {
                if (!line.trim()) return <br key={j} />;
                if (line.startsWith('•')) {
                  const boldMatch = line.match(/\*\*(.+?)\*\*/);
                  return (
                    <p key={j} className="flex gap-2">
                      <span className="text-primary mt-0.5 shrink-0">•</span>
                      <span>
                        {boldMatch ? (
                          <>
                            <strong className="text-foreground font-medium">{boldMatch[1]}</strong>
                            {line.split('**').slice(2).join('**')}
                          </>
                        ) : (
                          line.slice(2)
                        )}
                      </span>
                    </p>
                  );
                }
                return <p key={j}>{line}</p>;
              })}
            </div>
          </motion.section>
        ))}

        {/* ─── Contact ─── */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
          <h3 className="font-bold mb-2">Des questions ?</h3>
          <p className="text-sm text-muted-foreground">
            Contactez notre responsable de la protection des données :{' '}
            <span className="text-foreground font-medium">contact@zalfoot.sn</span>
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
