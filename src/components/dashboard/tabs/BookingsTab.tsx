'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  Trash2,
  Phone,
  Loader2,
  CalendarDays,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

/* ── Types ── */

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  timeSlot: string;
  status: string;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt: string;
}

type FilterTab = 'all' | 'confirmed' | 'upcoming' | 'past';

/* ── Helpers ── */

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('zalsports_admin_token');
}

function statusBadge(status: string) {
  switch (status) {
    case 'confirmed':
      return <Badge className="bg-primary/15 text-primary border-primary/30 hover:bg-primary/20">Confirmé</Badge>;
    case 'completed':
      return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20">Terminé</Badge>;
    case 'cancelled':
      return <Badge className="bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/20">Annulé</Badge>;
    case 'pending':
      return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 hover:bg-amber-500/20">En attente</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function paymentBadge(method?: string) {
  if (!method) return <span className="text-xs text-muted-foreground">—</span>;
  return <Badge variant="outline" className="text-xs">{method}</Badge>;
}

/* ── Component ── */

export default function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [form, setForm] = useState({ customerName: '', customerPhone: '', date: '', timeSlot: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch('/api/admin/bookings', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        setBookings(json.data || json || []);
      }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const today = new Date().toISOString().split('T')[0];

  const filtered = bookings.filter((b) => {
    // Filter tab
    if (filterTab === 'confirmed' && b.status !== 'confirmed') return false;
    if (filterTab === 'upcoming' && (b.status === 'completed' || b.status === 'cancelled' || b.date < today)) return false;
    if (filterTab === 'past' && b.status !== 'completed' && b.status !== 'cancelled' && b.date >= today) return false;
    // Search
    if (search) {
      const q = search.toLowerCase();
      return (
        b.customerName.toLowerCase().includes(q) ||
        b.customerPhone.includes(q) ||
        b.date.includes(q) ||
        b.timeSlot.includes(q)
      );
    }
    return true;
  });

  const handleAdd = async () => {
    if (!form.customerName || !form.customerPhone || !form.date || !form.timeSlot) return;
    setSubmitting(true);
    try {
      const token = getToken();
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setDialogOpen(false);
        setForm({ customerName: '', customerPhone: '', date: '', timeSlot: '' });
        fetchBookings();
      }
    } catch { /* silent */ } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      const token = getToken();
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'completed' }),
      });
      if (res.ok) fetchBookings();
    } catch { /* silent */ }
  };

  const handleCancel = async (id: string) => {
    try {
      const token = getToken();
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (res.ok) fetchBookings();
    } catch { /* silent */ }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = getToken();
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchBookings();
    } catch { /* silent */ }
  };

  const filterTabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'Toutes' },
    { id: 'confirmed', label: 'En cours' },
    { id: 'upcoming', label: 'À venir' },
    { id: 'past', label: 'Passées' },
  ];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="bookings-content"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.35 }}
        className="p-6 space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Réservations</h1>
            <p className="text-muted-foreground mt-1 text-sm">Gérez toutes vos réservations</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Ajouter
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex bg-secondary rounded-lg p-0.5">
            {filterTabs.map((ft) => (
              <button
                key={ft.id}
                onClick={() => setFilterTab(ft.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  filterTab === ft.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {ft.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Table */}
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-xs">Client</TableHead>
                    <TableHead className="text-xs">Tél</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Créneau</TableHead>
                    <TableHead className="text-xs">Statut</TableHead>
                    <TableHead className="text-xs">Paiement</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                        <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        Aucune réservation trouvée.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((b) => (
                      <TableRow key={b.id} className="border-border/30">
                        <TableCell className="text-sm font-medium">{b.customerName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{b.customerPhone}</TableCell>
                        <TableCell className="text-sm">
                          {format(parseISO(b.date), 'dd MMM yyyy', { locale: fr })}
                        </TableCell>
                        <TableCell className="text-sm font-mono">{b.timeSlot}</TableCell>
                        <TableCell>{statusBadge(b.status)}</TableCell>
                        <TableCell>{paymentBadge(b.paymentMethod)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-0.5">
                            <Button
                              variant="ghost" size="sm" className="h-7 w-7 p-0"
                              onClick={() => { setViewBooking(b); setViewDialogOpen(true); }}
                              title="Voir"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            {b.status === 'confirmed' && (
                              <>
                                <Button
                                  variant="ghost" size="sm" className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                                  onClick={() => handleComplete(b.id)} title="Terminer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                                  onClick={() => handleCancel(b.id)} title="Annuler"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(b.id)} title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Add Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle réservation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Nom du client</Label>
                <Input
                  placeholder="Nom complet"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  placeholder="+221 XX XXX XXXX"
                  value={form.customerPhone}
                  onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Créneau horaire</Label>
                <Input
                  placeholder="ex: 10:00 - 11:00"
                  value={form.timeSlot}
                  onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleAdd} disabled={submitting || !form.customerName || !form.customerPhone || !form.date || !form.timeSlot}>
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Ajouter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Détails de la réservation</DialogTitle>
            </DialogHeader>
            {viewBooking && (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Client</p>
                    <p className="text-sm font-medium">{viewBooking.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Téléphone</p>
                    <p className="text-sm font-medium">{viewBooking.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Date</p>
                    <p className="text-sm font-medium">{format(parseISO(viewBooking.date), 'dd MMMM yyyy', { locale: fr })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Créneau</p>
                    <p className="text-sm font-medium">{viewBooking.timeSlot}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Statut</p>
                    {statusBadge(viewBooking.status)}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Paiement</p>
                    {paymentBadge(viewBooking.paymentMethod)}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Créé le</p>
                  <p className="text-sm">{format(parseISO(viewBooking.createdAt), 'dd MMM yyyy à HH:mm', { locale: fr })}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </AnimatePresence>
  );
}
