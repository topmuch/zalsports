'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  Save,
  Globe,
  Mail,
  MapPin,
  Search,
  Settings,
} from 'lucide-react';

/* ── Types ── */

interface SiteSettings {
  siteName: string;
  logoUrl: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

const defaultSettings: SiteSettings = {
  siteName: '',
  logoUrl: '',
  description: '',
  address: '',
  phone: '',
  email: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
};

/* ── Helpers ── */

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('zalsports_admin_token');
}

/* ── Component ── */

export default function SettingsTab() {
  const [form, setForm] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch('/api/admin/settings', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setForm({ ...defaultSettings, ...data });
      }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const token = getToken();
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch { /* silent */ } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-10 w-64 rounded-lg bg-card border border-border animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-[200px] rounded-2xl bg-card border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="settings-content"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.35 }}
        className="p-6 space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Paramètres</h1>
            <p className="text-muted-foreground mt-1 text-sm">Configuration générale du site</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>

        {saved && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 text-sm text-primary font-medium">
            ✓ Paramètres enregistrés avec succès !
          </div>
        )}

        {/* Identité */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Identité du site</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom du site</Label>
                <Input
                  value={form.siteName}
                  onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                  placeholder="ZalFoot"
                />
              </div>
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input
                  value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            {form.logoUrl && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
                <img
                  src={form.logoUrl}
                  alt="Logo preview"
                  className="h-10 w-10 rounded-lg object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <span className="text-xs text-muted-foreground">Aperçu du logo</span>
              </div>
            )}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Description de votre terrain de football..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Contact</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Adresse
              </Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Adresse complète"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+221 XX XXX XXXX"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contact@zalsports.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold">SEO</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input
                value={form.seoTitle}
                onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                placeholder="ZalFoot — Terrain de football"
              />
            </div>
            <div className="space-y-2">
              <Label>Description SEO</Label>
              <Textarea
                value={form.seoDescription}
                onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                placeholder="Résumé pour les moteurs de recherche..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Mots-clés</Label>
              <Input
                value={form.seoKeywords}
                onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })}
                placeholder="football, terrain, réservation, Sénégal"
              />
              <p className="text-xs text-muted-foreground">Séparez les mots-clés par des virgules</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
