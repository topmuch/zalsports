'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Filter,
  CalendarDays,
  Trash2,
  Check,
  X,
  Clock,
  User,
  Phone,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/* ── Types ── */

interface Booking {
  id: string;
  date: string;
  timeSlot: string;
  customerName: string;
  customerPhone: string;
  status: string;
  paymentStatus: string;
  amount: number;
  depositPaid: number;
  createdAt: string;
  updatedAt: string;
}

/* ── Helpers ── */

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('zalsports_admin_token');
}

function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'dd MMM yyyy', { locale: fr });
  } catch {
    return dateStr;
  }
}

function formatMoney(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} FCFA`;
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    confirmed: {
      label: 'Confirmée',
      className: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/25 hover:bg-emerald-500/20',
    },
    pending: {
      label: 'En attente',
      className: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/25 hover:bg-yellow-500/20',
    },
    cancelled: {
      label: 'Annulée',
      className: 'bg-red-500/15 text-red-700 border-red-500/25 hover:bg-red-500/20',
    },
    completed: {
      label: 'Terminée',
      className: 'bg-blue-500/15 text-blue-700 border-blue-500/25 hover:bg-blue-500/20',
    },
  };
  const s = map[status] ?? { label: status, className: 'bg-muted text-muted-foreground' };
  return (
    <Badge variant="outline" className={s.className}>
      {s.label}
    </Badge>
  );
}

function paymentBadge(paymentStatus: string) {
  const map: Record<string, { label: string; className: string }> = {
    paid: {
      label: 'Payé',
      className: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/25 hover:bg-emerald-500/20',
    },
    partial: {
      label: 'Partiel',
      className: 'bg-orange-500/15 text-orange-700 border-orange-500/25 hover:bg-orange-500/20',
    },
    unpaid: {
      label: 'Impayé',
      className: 'bg-gray-500/15 text-gray-600 border-gray-500/25 hover:bg-gray-500/20',
    },
  };
  const p = map[paymentStatus] ?? { label: paymentStatus, className: 'bg-muted text-muted-foreground' };
  return (
    <Badge variant="outline" className={p.className}>
      {p.label}
    </Badge>
  );
}

/* ── Component ── */

export default function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [cancelDialogId, setCancelDialogId] = useState<string | null>(null);
  const [completeDialogId, setCompleteDialogId] = useState<string | null>(null);

  /* ── Fetch ── */

  const fetchBookings = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch('/api/bookings', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Erreur de chargement');
      const json = await res.json();
      setBookings(json.data ?? []);
    } catch (err) {
      toast.error('Impossible de charger les réservations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  /* ── Stats ── */

  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
    const cancelled = bookings.filter((b) => b.status === 'cancelled').length;
    const completed = bookings.filter((b) => b.status === 'completed').length;
    return { total, confirmed, cancelled, completed };
  }, [bookings]);

  const statCards = [
    { label: 'Total', value: stats.total, icon: CalendarDays, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Confirmées', value: stats.confirmed, icon: Check, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { label: 'Annulées', value: stats.cancelled, icon: X, color: 'text-red-600', bg: 'bg-red-500/10' },
    { label: 'Terminées', value: stats.completed, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-500/10' },
  ];

  /* ── Filtered list ── */

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch =
        search === '' ||
        b.customerName.toLowerCase().includes(search.toLowerCase()) ||
        b.customerPhone.includes(search);
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  /* ── Actions ── */

  async function handleCancel(id: string) {
    setCancelling(id);
    try {
      const token = getToken();
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error();
      toast.success('Réservation annulée');
      fetchBookings();
    } catch {
      toast.error("Impossible d'annuler la réservation");
    } finally {
      setCancelling(null);
      setCancelDialogId(null);
    }
  }

  async function handleComplete(id: string) {
    setUpdating(id);
    try {
      const token = getToken();
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: 'completed' }),
      });
      if (!res.ok) throw new Error();
      toast.success('Réservation marquée comme terminée');
      fetchBookings();
    } catch {
      toast.error('Impossible de mettre à jour la réservation');
    } finally {
      setUpdating(null);
      setCompleteDialogId(null);
    }
  }

  /* ── Render ── */

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`${s.bg} p-3 rounded-xl`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou téléphone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="confirmed">Confirmées</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="cancelled">Annulées</SelectItem>
              <SelectItem value="completed">Terminées</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <CalendarDays className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-lg font-medium">Aucune réservation trouvée</p>
              <p className="text-sm">Essayez de modifier vos filtres</p>
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Créneau</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Paiement</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {formatDate(booking.date)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{booking.timeSlot}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span>{booking.customerName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span>{booking.customerPhone}</span>
                        </div>
                      </TableCell>
                      <TableCell>{statusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {paymentBadge(booking.paymentStatus)}
                          <span className="text-xs text-muted-foreground">
                            {formatMoney(booking.amount)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 border-emerald-500/25"
                              onClick={() => setCompleteDialogId(booking.id)}
                              disabled={updating === booking.id}
                            >
                              {updating === booking.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                              <span className="sr-only">Terminer</span>
                            </Button>
                          )}
                          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-500/10 border-red-500/25"
                              onClick={() => setCancelDialogId(booking.id)}
                              disabled={cancelling === booking.id}
                            >
                              {cancelling === booking.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                              <span className="sr-only">Annuler</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel confirmation dialog */}
      <AlertDialog open={!!cancelDialogId} onOpenChange={(open) => !open && setCancelDialogId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler la réservation</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Retour</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelDialogId && handleCancel(cancelDialogId)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Annuler
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete confirmation dialog */}
      <Dialog open={!!completeDialogId} onOpenChange={(open) => !open && setCompleteDialogId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marquer comme terminée</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Voulez-vous marquer cette réservation comme terminée ?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteDialogId(null)}>
              Retour
            </Button>
            <Button
              onClick={() => completeDialogId && handleComplete(completeDialogId)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
