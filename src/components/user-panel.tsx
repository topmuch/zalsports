'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  PlusCircle,
  Settings,
  Phone,
  User,
  Mail,
  Bell,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CreditCard,
  Zap,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Trash2,
  Loader2,
  Save,
} from 'lucide-react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */

interface Booking {
  id: string;
  date: string;
  timeSlot: string;
  customerName: string;
  customerPhone: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  amount: number;
  depositPaid: number;
  createdAt: string;
  updatedAt: string;
}

interface UserProfile {
  phone: string;
  name: string;
  email: string;
  notifications: boolean;
}

interface UserStats {
  totalBookings: number;
  byStatus: { confirmed: number; completed: number; cancelled: number; pending: number };
  upcomingCount: number;
  upcomingBookings: Booking[];
  totalDepositsPaid: number;
  favoriteSlot: string | null;
  monthlyTrend: { month: string; count: number }[];
}

interface CalendarDay {
  date: string;
  bookingCount: number;
  bookings: { id: string; timeSlot: string; status: string; paymentStatus: string }[];
}

interface TimeSlot {
  id: string;
  time: string;
  label: string;
  available: boolean;
}

type Tab = 'calendar' | 'reservations' | 'new' | 'settings';
type ReservationFilter = 'active' | 'paid' | 'unpaid' | 'all';

/* ═══════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════ */

function formatMoney(n: number): string {
  return n.toLocaleString('fr-FR') + ' FCFA';
}

function statusBadge(status: Booking['status']) {
  switch (status) {
    case 'pending':
      return <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30">En attente</Badge>;
    case 'confirmed':
      return <Badge className="bg-primary/15 text-primary border-primary/30">Confirmé</Badge>;
    case 'completed':
      return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Terminé</Badge>;
    case 'cancelled':
      return <Badge className="bg-destructive/15 text-destructive border-destructive/30">Annulé</Badge>;
  }
}

function paymentBadge(status: Booking['paymentStatus']) {
  switch (status) {
    case 'paid':
      return (
        <span className="flex items-center gap-1 text-xs text-emerald-400">
        <CheckCircle2 className="w-3 h-3" /> Payé
      </span>
      );
    case 'partial':
      return (
        <span className="flex items-center gap-1 text-xs text-amber-400">
        <AlertCircle className="w-3 h-3" /> Acompte
      </span>
      );
    case 'unpaid':
      return (
        <span className="flex items-center gap-1 text-xs text-destructive">
        <XCircle className="w-3 h-3" /> Non payé
      </span>
      );
  }
}

function generateTimeSlots(availableHours?: Set<string>): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let h = 8; h <= 23; h++) {
    const timeStr = `${h.toString().padStart(2, '0')}:00`;
    slots.push({
      id: `slot-${h}`,
      time: timeStr,
      label: `${timeStr} – ${(h + 1).toString().padStart(2, '0')}:00`,
      available: availableHours ? !availableHours.has(timeStr) : true,
    });
  }
  return slots;
}

/* ═══════════════════════════════════════════
   Phone Login Screen
   ═══════════════════════════════════════════ */

function PhoneLogin({ onLogin }: { onLogin: (phone: string) => void }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^\+?221\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/.test(phone.trim())) {
      setError('Format invalide. Ex: 78 278 49 49');
      return;
    }
    setLoading(true);
    // Try to find profile, if not found create one on the fly
    try {
      const res = await fetch(`/api/user/profile?phone=${encodeURIComponent(phone.trim())}`);
      if (res.ok || res.status === 404) {
        onLogin(phone.trim());
      } else {
        setError('Erreur serveur. Réessayez.');
      }
    } catch {
      setError('Erreur de connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Phone className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Mon espace</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Entrez votre numéro pour accéder à vos réservations et paramètres.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="login-phone" className="sr-only">Téléphone</Label>
            <Input
              id="login-phone"
              placeholder="78 278 49 49"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="text-center text-lg h-12"
              autoFocus
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" className="w-full h-12" disabled={loading || !phone}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Phone className="w-4 h-4 mr-2" /> Accéder</>}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">
          Aucun compte requis — votre numéro vous identifie.
        </p>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Tab: Calendar
   ═══════════════════════════════════════════ */

function CalendarTab({ phone }: { phone: string }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);

  const fetchCalendar = useCallback(async (date: Date) => {
    setLoading(true);
    try {
      const y = date.getFullYear();
      const m = date.getMonth() + 1;
      const res = await fetch(`/api/user/calendar?phone=${encodeURIComponent(phone)}&year=${y}&month=${m}`);
      if (res.ok) {
        const data = await res.json();
        setCalendarData(data.days || []);
      }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [phone]);

  useEffect(() => { fetchCalendar(currentMonth); }, [currentMonth, fetchCalendar]);

  const bookingDates = new Set(calendarData.map(d => d.date));
  const selectedDayData = selectedDate ? calendarData.find(d => d.date === format(selectedDate, 'yyyy-MM-dd')) : null;

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-sm font-semibold">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h3>
        <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          modifiers={{
            hasBookings: (date) => bookingDates.has(format(date, 'yyyy-MM-dd')),
          }}
          modifiersClassNames={{
            hasBookings: 'bg-primary/20 font-bold',
          }}
          className="rounded-xl border border-border"
          classNames={{
            day_selected: 'bg-primary text-primary-foreground rounded-md',
            day_today: 'bg-accent text-accent-foreground rounded-md',
          }}
        />
      </div>

      {/* Selected Day Detail */}
      {selectedDate && (
        <AnimatePresence mode="wait">
          <motion.div
            key={format(selectedDate, 'yyyy-MM-dd')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-secondary/50 rounded-xl p-4 space-y-3"
          >
            <h4 className="text-sm font-semibold">
              {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </h4>
            {selectedDayData && selectedDayData.bookings.length > 0 ? (
              <div className="space-y-2">
                {selectedDayData.bookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between bg-card rounded-lg p-3 border border-border">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-sm font-mono font-medium">{b.timeSlot}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {statusBadge(b.status as Booking['status'])}
                      {paymentBadge(b.paymentStatus as Booking['paymentStatus'])}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune réservation ce jour.
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary/20 border border-primary/40" /> Jour avec réservation</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Tab: Reservations
   ═══════════════════════════════════════════ */

function ReservationsTab({ phone }: { phone: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<ReservationFilter>('active');
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ phone, limit: '50' });
      const res = await fetch(`/api/user/bookings?${params}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings);
      }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [phone]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleCancel = async (id: string) => {
    try {
      const res = await fetch(`/api/user/bookings/${id}?phone=${encodeURIComponent(phone)}`, { method: 'DELETE' });
      if (res.ok) fetchBookings();
    } catch { /* silent */ }
  };

  const filtered = bookings.filter((b) => {
    if (filter === 'active') return b.status === 'confirmed' || b.status === 'pending';
    if (filter === 'paid') return b.paymentStatus === 'paid' && b.status !== 'cancelled';
    if (filter === 'unpaid') return b.paymentStatus === 'unpaid' && b.status !== 'cancelled';
    return true;
  });

  const filters: { key: ReservationFilter; label: string; count: number }[] = [
    { key: 'active', label: 'En cours', count: bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length },
    { key: 'paid', label: 'Payées', count: bookings.filter(b => b.paymentStatus === 'paid' && b.status !== 'cancelled').length },
    { key: 'unpaid', label: 'À payer', count: bookings.filter(b => b.paymentStatus === 'unpaid' && b.status !== 'cancelled').length },
    { key: 'all', label: 'Toutes', count: bookings.length },
  ];

  return (
    <div className="space-y-5">
      {/* Filter Tabs */}
      <div className="flex bg-secondary rounded-lg p-0.5">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
              filter === f.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {f.label} <span className="ml-1 opacity-60">({f.count})</span>
          </button>
        ))}
      </div>

      {/* Booking List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-card border border-border animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucune réservation trouvée.</p>
          </div>
        ) : (
          filtered.map((b) => {
            const isPast = isBefore(parseISO(b.date), new Date());
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-mono font-semibold text-primary">{b.timeSlot}</span>
                      {statusBadge(b.status)}
                      {paymentBadge(b.paymentStatus)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(b.date), 'EEEE d MMMM yyyy', { locale: fr })}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> {formatMoney(b.amount)}</span>
                      {b.depositPaid > 0 && <span className="text-emerald-400">Acompte: {formatMoney(b.depositPaid)}</span>}
                    </div>
                  </div>
                  {!isPast && (b.status === 'confirmed' || b.status === 'pending') && (
                    <Button
                      variant="ghost" size="sm" className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => handleCancel(b.id)} title="Annuler"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Tab: New Reservation (Demande)
   ═══════════════════════════════════════════ */

function NewReservationTab({ phone, name, onCreated }: { phone: string; name: string; onCreated: () => void }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [step, setStep] = useState<'select' | 'confirm'>('select');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchSlots = useCallback(async (date: Date) => {
    setLoadingSlots(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const res = await fetch(`/api/bookings?date=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        const bookedSet = new Set(data.available.filter((s: { available: boolean; time: string }) => !s.available).map((s: { time: string }) => s.time));
        setSlots(generateTimeSlots(bookedSet));
      } else {
        setSlots(generateTimeSlots());
      }
    } catch { setSlots(generateTimeSlots()); } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => { fetchSlots(addDays(new Date(), 1)); }, [fetchSlots]);
  useEffect(() => {
    if (selectedDate) { setSelectedSlot(null); fetchSlots(selectedDate); }
  }, [selectedDate, fetchSlots]);

  const handleSubmit = async () => {
    if (!selectedSlot || !selectedDate) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: format(selectedDate, 'yyyy-MM-dd'),
          timeSlot: selectedSlot.time,
          customerName: name,
          customerPhone: phone,
        }),
      });
      if (res.ok) {
        setSuccess(true);
        onCreated();
      }
    } catch { /* silent */ } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Demande envoyée !</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
            Votre réservation a été enregistrée. Vous recevrez une confirmation par SMS.
          </p>
        </div>
        <Button variant="outline" onClick={() => { setSuccess(false); setStep('select'); setSelectedSlot(null); }}>
          Nouvelle réservation
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-secondary/50 rounded-xl p-4 flex items-center gap-3">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Sélectionnez votre date et créneau. La réservation sera confirmée immédiatement.
        </p>
      </div>

      {step === 'select' && (
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium mb-3 block">Date</Label>
            <div className="flex justify-center">
              <Calendar
                mode="single" selected={selectedDate} onSelect={setSelectedDate}
                disabled={{ before: new Date() }}
                className="rounded-xl border border-border"
                classNames={{ day_selected: 'bg-primary text-primary-foreground rounded-md', day_today: 'bg-accent text-accent-foreground rounded-md' }}
              />
            </div>
          </div>
          {selectedDate && (
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Créneaux — {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
              </Label>
              {loadingSlots ? (
                <div className="grid grid-cols-3 gap-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-11 rounded-lg bg-secondary/50 animate-pulse" />)}</div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.id} disabled={!slot.available} onClick={() => setSelectedSlot(slot)}
                      className={`relative p-2.5 rounded-lg border text-sm font-medium transition-all ${
                        !slot.available
                          ? 'border-border/50 bg-secondary/30 text-muted-foreground/50 cursor-not-allowed line-through'
                          : selectedSlot?.id === slot.id
                            ? 'border-primary bg-primary/15 text-primary'
                            : 'border-border bg-secondary/50 hover:border-primary/50'
                      }`}
                    >
                      {slot.time}
                      {!slot.available && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-destructive/60" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {selectedSlot && (
            <Button className="w-full" size="lg" onClick={() => setStep('confirm')}>
              Continuer <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {step === 'confirm' && selectedSlot && selectedDate && (
        <div className="space-y-5">
          <Card className="bg-card border-border">
            <CardContent className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Créneau</span>
                <span className="font-medium">{selectedSlot.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Prix total</span>
                <span className="font-bold text-primary">25 000 FCFA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Acompte</span>
                <span className="font-medium">5 000 FCFA</span>
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setStep('select')}>Retour</Button>
            <Button className="flex-1" disabled={isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Zap className="w-4 h-4 mr-1.5" /> Confirmer</>}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Tab: Settings (Paramètres)
   ═══════════════════════════════════════════ */

function SettingsTab({ phone, initialName }: { phone: string; initialName: string }) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/user/profile?phone=${encodeURIComponent(phone)}`);
        if (res.ok) {
          const data = await res.json();
          setName(data.profile.name);
          setEmail(data.profile.email);
          setNotifications(data.profile.notifications);
        }
      } catch { /* silent */ } finally {
        setLoading(false);
      }
    })();
  }, [phone]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name, email, notifications }),
      });
      if (res.ok) setSaved(true);
    } catch { /* silent */ } finally {
      setSaving(false);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-card border border-border animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-4">Informations personnelles</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="settings-name">Nom complet</Label>
            <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" placeholder="Votre nom" />
          </div>
          <div>
            <Label htmlFor="settings-phone">Téléphone</Label>
            <Input id="settings-phone" value={phone} disabled className="mt-1.5 opacity-60" />
            <p className="text-xs text-muted-foreground mt-1">Le téléphone ne peut pas être modifié.</p>
          </div>
          <div>
            <Label htmlFor="settings-email">Email (optionnel)</Label>
            <Input id="settings-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" placeholder="votre@email.com" />
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-5">
        <h3 className="text-sm font-semibold mb-4">Préférences</h3>
        <div className="flex items-center justify-between bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Notifications SMS</p>
              <p className="text-xs text-muted-foreground">Recevoir un rappel avant votre créneau</p>
            </div>
          </div>
          <Switch checked={notifications} onCheckedChange={setNotifications} />
        </div>
      </div>

      <Button className="w-full" onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1.5" /> Enregistrer</>}
      </Button>
      {saved && <p className="text-xs text-emerald-400 text-center">Paramètres sauvegardés.</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main UserPanel
   ═══════════════════════════════════════════ */

export default function UserPanel({ onBack }: { onBack: () => void }) {
  const [phone, setPhone] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('calendar');
  const [stats, setStats] = useState<UserStats | null>(null);

  const handleLogin = useCallback((p: string) => {
    setPhone(p);
    // Try to get the profile name
    fetch(`/api/user/profile?phone=${encodeURIComponent(p)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.profile?.name) setUserName(data.profile.name); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!phone) return;
    fetch(`/api/user/stats?phone=${encodeURIComponent(phone)}`)
      .then(r => r.ok ? r.json() : null)
      .then(setStats)
      .catch(() => {});
  }, [phone]);

  const tabs: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'calendar', label: 'Calendrier', icon: CalendarDays },
    { key: 'reservations', label: 'Réservations', icon: ClipboardList },
    { key: 'new', label: 'Réserver', icon: PlusCircle },
    { key: 'settings', label: 'Paramètres', icon: Settings },
  ];

  // Phone login screen
  if (!phone) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Retour
            </Button>
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="ZalFoot" width={24} height={24} className="rounded-md" />
              <span className="text-base font-bold"><span className="text-primary">Zal</span>Foot</span>
            </div>
            <div className="w-16" />
          </div>
        </header>
        <main className="flex-1"><PhoneLogin onLogin={handleLogin} /></main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Retour
          </Button>
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="ZalFoot" width={24} height={24} className="rounded-md" />
            <span className="text-base font-bold"><span className="text-primary">Zal</span>Foot</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="w-3 h-3" />
            <span className="hidden sm:inline">{phone}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Welcome + Stats */}
        {stats && (
          <div className="mb-6">
            <h1 className="text-xl font-bold">
              {userName ? `Bonjour, ${userName.split(' ')[0]}` : 'Bonjour'} !
            </h1>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-primary">{stats.upcomingCount}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">À venir</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-emerald-400">{stats.byStatus.completed}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Terminées</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <p className="text-lg font-bold">{stats.totalBookings}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Bar */}
        <div className="flex bg-secondary rounded-lg p-0.5 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-medium rounded-md transition-all ${
                activeTab === t.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'calendar' && <CalendarTab phone={phone} />}
            {activeTab === 'reservations' && <ReservationsTab phone={phone} />}
            {activeTab === 'new' && <NewReservationTab phone={phone} name={userName || 'Utilisateur'} onCreated={() => {
              // Refresh stats
              fetch(`/api/user/stats?phone=${encodeURIComponent(phone)}`)
                .then(r => r.ok ? r.json() : null)
                .then(setStats)
                .catch(() => {});
            }} />}
            {activeTab === 'settings' && <SettingsTab phone={phone} initialName={userName} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-5 mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ZalFoot — Mon espace</p>
        </div>
      </footer>
    </div>
  );
}
