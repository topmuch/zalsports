'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Pencil,
  Trash2,
  CreditCard,
  Loader2,
  Check,
  Clock,
} from 'lucide-react';

/* ── Types ── */

interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string;
  active: boolean;
  createdAt: string;
}

/* ── Helpers ── */

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('zalsports_admin_token');
}

function formatMoney(n: number): string {
  return n.toLocaleString('fr-FR') + ' FCFA';
}

/* ── Component ── */

export default function SubscriptionsTab() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', price: '', duration: '', features: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch('/api/admin/plans', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) setPlans(await res.json());
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const openAddDialog = () => {
    setEditPlan(null);
    setForm({ name: '', price: '', duration: '', features: '' });
    setDialogOpen(true);
  };

  const openEditDialog = (plan: Plan) => {
    setEditPlan(plan);
    setForm({ name: plan.name, price: String(plan.price), duration: plan.duration, features: plan.features });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.duration) return;
    setSubmitting(true);
    try {
      const token = getToken();
      const url = editPlan ? `/api/admin/plans/${editPlan.id}` : '/api/admin/plans';
      const method = editPlan ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
      if (res.ok) {
        setDialogOpen(false);
        fetchPlans();
      }
    } catch { /* silent */ } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (plan: Plan) => {
    try {
      const token = getToken();
      const res = await fetch(`/api/admin/plans/${plan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...plan, active: !plan.active }),
      });
      if (res.ok) fetchPlans();
    } catch { /* silent */ }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const token = getToken();
      const res = await fetch(`/api/admin/plans/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchPlans();
    } catch { /* silent */ } finally {
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="subscriptions-content"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.35 }}
        className="p-6 space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Abonnements</h1>
            <p className="text-muted-foreground mt-1 text-sm">Gérez les formules d'abonnement</p>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="w-4 h-4 mr-1.5" /> Nouvelle formule
          </Button>
        </div>

        {/* Plans Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[200px] rounded-2xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16">
            <CreditCard className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">Aucune formule d'abonnement.</p>
            <Button variant="outline" className="mt-4" onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-1.5" /> Créer une formule
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <Card key={plan.id} className={`bg-card border-border transition-colors ${!plan.active ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base font-semibold">{plan.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={plan.active ? 'default' : 'secondary'} className="text-[10px]">
                        {plan.active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{formatMoney(plan.price)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {plan.duration}
                  </div>
                  {plan.features && (
                    <ul className="space-y-1.5">
                      {plan.features.split('\n').filter(Boolean).map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Switch checked={plan.active} onCheckedChange={() => handleToggle(plan)} />
                      <span className="text-xs text-muted-foreground">{plan.active ? 'Actif' : 'Inactif'}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(plan)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => { setDeleteId(plan.id); setDeleteDialogOpen(true); }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editPlan ? 'Modifier la formule' : 'Nouvelle formule'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Nom de la formule</Label>
                <Input
                  placeholder="ex: Mensuel, Trimestriel..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Prix (FCFA)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Durée</Label>
                <Input
                  placeholder="ex: 1 mois, 3 mois..."
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Avantages (un par ligne)</Label>
                <Textarea
                  placeholder={"Accès illimité\nRéservation prioritaire\nRemise 10%"}
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleSubmit} disabled={submitting || !form.name || !form.price || !form.duration}>
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {editPlan ? 'Enregistrer' : 'Créer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer cette formule ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Tous les abonnements liés à cette formule seront affectés.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </AnimatePresence>
  );
}
