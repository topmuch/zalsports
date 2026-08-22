'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  MessageCircle,
  Instagram,
} from 'lucide-react';
import PageLayout from './PageLayout';

const CONTACT_INFO = [
  {
    icon: MapPin,
    title: 'Adresse',
    lines: ['ZalFoot Arena', 'Dakar, Sénégal'],
  },
  {
    icon: Phone,
    title: 'Téléphone',
    lines: ['+221 78 123 45 67', '+221 76 987 65 43'],
  },
  {
    icon: Mail,
    title: 'Email',
    lines: ['contact@zalfoot.sn', 'support@zalfoot.sn'],
  },
  {
    icon: Clock,
    title: 'Horaires',
    lines: ['Tous les jours', '08:00 – 00:00'],
  },
];

const SOCIALS = [
  { icon: MessageCircle, label: 'WhatsApp', handle: '+221 78 123 45 67' },
  { icon: Instagram, label: 'Instagram', handle: '@zalfoot.sn' },
];

export default function ContactPage({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 1200);
  };

  return (
    <PageLayout
      title="Contactez-nous"
      subtitle="Une question, une réservation spéciale ou un partenariat ? Nous sommes à votre écoute."
      onBack={onBack}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* ─── Left: Info ─── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              {CONTACT_INFO.map((item) => (
                <div key={item.title} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    {item.lines.map((line, i) => (
                      <p key={i} className="text-sm text-muted-foreground">{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Socials */}
            <div className="pt-4 border-t border-border">
              <p className="text-sm font-semibold mb-3">Réseaux sociaux</p>
              <div className="flex gap-3">
                {SOCIALS.map((s) => (
                  <button
                    key={s.label}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary border border-border text-sm hover:border-primary/40 transition-all"
                  >
                    <s.icon className="w-4 h-4 text-primary" />
                    <div className="text-left">
                      <p className="font-medium text-xs">{s.label}</p>
                      <p className="text-[11px] text-muted-foreground">{s.handle}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="pt-4 border-t border-border">
              <p className="text-sm font-semibold mb-3">Localisation</p>
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-secondary border border-border flex items-center justify-center">
                <div className="text-center space-y-2">
                  <MapPin className="w-8 h-8 text-primary mx-auto" />
                  <p className="text-sm font-medium">Dakar, Sénégal</p>
                  <p className="text-xs text-muted-foreground">Coordonnées GPS</p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Right: Form ─── */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              {sent ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Message envoyé !</h3>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.
                  </p>
                  <Button variant="outline" className="mt-4" onClick={() => { setSent(false); setName(''); setEmail(''); setSubject(''); setMessage(''); }}>
                    Envoyer un autre message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="text-lg font-bold">Envoyez-nous un message</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact-name">Nom complet</Label>
                      <Input
                        id="contact-name"
                        placeholder="Votre nom"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1.5"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-email">Email</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1.5"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="contact-subject">Sujet</Label>
                    <Input
                      id="contact-subject"
                      placeholder="Réservation, partenariat, question..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="mt-1.5"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-message">Message</Label>
                    <Textarea
                      id="contact-message"
                      placeholder="Décrivez votre demande..."
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="mt-1.5"
                      required
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full glow-green" disabled={sending}>
                    {sending ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Envoi en cours...
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" /> Envoyer le message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
