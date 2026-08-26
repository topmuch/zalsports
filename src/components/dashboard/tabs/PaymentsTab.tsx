'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Plus,
  Wallet,
  Loader2,
  Smartphone,
  Banknote,
} from 'lucide-react';

/* ── Types ── */

interface PaymentMethod {
  id: string;
  name: string;
  type: 'wave' | 'orange_money' | 'cash' | string;
  merchantPhone?: string;
  active: boolean;
}

/* ── Helpers ── */

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('zalsports_admin_token');
}

function methodLogo(type: string) {
  switch (type) {
    case 'wave':
      return (
        <div className="w-12 h-12 rounded-xl bg-[#1DC3E0]/10 border border-[#1DC3E0]/20 flex items-center justify-center">
          <span className="text-[#1DC3E0] font-bold text-lg">W</span>
        </div>
      );
    case 'orange_money':
      return (
        <div className="w-12 h-12 rounded-xl bg-[#FF6600]/10 border border-[#FF6600]/20 flex items-center justify-center">
          <span className="text-[#FF6600] font-bold text-sm">OM</span>
        </div>
      );
    case 'cash':
      return (
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Banknote className="w-6 h-6 text-emerald-500" />
        </div>
      );
    default:
      return (
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Smartphone className="w-6 h-6 text-primary" />
        </div>
      );
  }
}

/* ── Component ── */

export default function PaymentsTab() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'wave', merchantPhone: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchMethods = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch('/api/admin/payments', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) setMethods(await res.json());
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  const handleToggle = async (method: PaymentMethod) => {
    try {
      const token = getToken();
      const res = await fetch(`/api/admin/payments/${method.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...method, active: !method.active }),
      });
      if (res.ok) fetchMethods();
    } catch { /* silent */ }
  };

  const handleSaveMerchantPhone = async (method: PaymentMethod, phone: string) => {
    try {
      const token = getToken();
      const res = await fetch(`/api/admin/payments/${method.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...method, merchantPhone: phone }),
      });
      if (res.ok) fetchMethods();
    } catch { /* silent */ }
  };

  const handleAdd = async () => {
    if (!form.name) return;
    setSubmitting(true);
    try {
      const token = getToken();
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setDialogOpen(false);
        setForm({ name: '', type: 'wave', merchantPhone: '' });
        fetchMethods();
      }
    } catch { /* silent */ } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="payments-content"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.35 }}
        className="p-6 space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Paiements</h1>
            <p className="text-muted-foreground mt-1 text-sm">Configurez les méthodes de paiement</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Nouvelle méthode
          </Button>
        </div>

        {/* Payment Methods Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[220px] rounded-2xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : methods.length === 0 ? (
          <div className="text-center py-16">
            <Wallet className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">Aucune méthode de paiement configurée.</p>
            <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Ajouter une méthode
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {methods.map((method) => (
              <Card
                key={method.id}
                className={`bg-card border-border transition-all ${!method.active ? 'opacity-60' : 'hover:border-primary/30'}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    {methodLogo(method.type)}
                    <Badge variant={method.active ? 'default' : 'secondary'} className="text-[10px]">
                      {method.active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold">{method.name}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">
                      {method.type === 'wave' ? 'Wave' : method.type === 'orange_money' ? 'Orange Money' : method.type === 'cash' ? 'Espèces' : method.type}
                    </p>
                  </div>

                  {(method.type === 'wave' || method.type === 'orange_money') && (
                    <div className="space-y-2">
                      <Label className="text-xs">Numéro marchand</Label>
                      <div className="flex gap-2">
                        <Input
                          className="text-sm"
                          defaultValue={method.merchantPhone || ''}
                          onBlur={(e) => handleSaveMerchantPhone(method, e.target.value)}
                          placeholder="+221 XX XXX XXXX"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Switch checked={method.active} onCheckedChange={() => handleToggle(method)} />
                      <span className="text-xs text-muted-foreground">{method.active ? 'Actif' : 'Inactif'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle méthode de paiement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input
                  placeholder="ex: Wave, Orange Money..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="flex gap-2">
                  {[{ value: 'wave', label: 'Wave' }, { value: 'orange_money', label: 'Orange Money' }, { value: 'cash', label: 'Espèces' }].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setForm({ ...form, type: t.value })}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                        ${form.type === t.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/30 text-muted-foreground'
                        }`
                      }
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              {(form.type === 'wave' || form.type === 'orange_money') && (
                <div className="space-y-2">
                  <Label>Numéro marchand</Label>
                  <Input
                    placeholder="+221 XX XXX XXXX"
                    value={form.merchantPhone}
                    onChange={(e) => setForm({ ...form, merchantPhone: e.target.value })}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleAdd} disabled={submitting || !form.name}>
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Ajouter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </AnimatePresence>
  );
}
