'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  Users,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isToday,
  isBefore,
  startOfDay,
  isSameMonth,
} from 'date-fns';
import { fr } from 'date-fns/locale';

/* ── Types ── */

interface Booking {
  id: string;
  date: string;
  timeSlot: string;
  customerName: string;
  customerPhone: string;
  status: string;
  createdAt: string;
}

interface MonthAvailability {
  fullyBooked: string[];
  disabledSlots: Record<string, string[]>;
}

/* ── Helpers ── */

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('zalsports_admin_token');
}

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

/* Monday = 0, Sunday = 6 — date-fns getDay: Sun=0, Sat=6 */
function getMondayBasedDay(date: Date): number {
  const d = getDay(date);
  return d === 0 ? 6 : d - 1;
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
      className: 'bg-slate-500/15 text-slate-600 border-slate-500/25 hover:bg-slate-500/20',
    },
  };
  const s = map[status] ?? { label: status, className: 'bg-muted text-muted-foreground' };
  return (
    <Badge variant="outline" className={s.className}>
      {s.label}
    </Badge>
  );
}

/* ── Component ── */

export default function CalendarTab() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState<MonthAvailability | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayBookings, setDayBookings] = useState<Booking[]>([]);
  const [dayLoading, setDayLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  /* ── Fetch month availability ── */

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const token = getToken();
        const year = format(currentMonth, 'yyyy');
        const month = format(currentMonth, 'MM');
        const res = await fetch(
          `/api/bookings/month-availability?year=${year}&month=${month}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        if (!res.ok) throw new Error('Erreur de chargement');
        const json = await res.json();
        if (!cancelled) {
          setAvailability({
            fullyBooked: json.fullyBooked ?? [],
            disabledSlots: json.disabledSlots ?? {},
          });
        }
      } catch {
        if (!cancelled) {
          toast.error('Impossible de charger les disponibilités du mois');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [currentMonth]);

  /* ── Fetch day bookings (called from event handlers) ── */

  async function fetchDayBookings(date: Date) {
    setDayLoading(true);
    try {
      const token = getToken();
      const dateStr = format(date, 'yyyy-MM-dd');
      const res = await fetch(`/api/bookings?date=${dateStr}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Erreur de chargement');
      const json = await res.json();
      setDayBookings(json.data ?? []);
    } catch {
      toast.error('Impossible de charger les réservations du jour');
      setDayBookings([]);
    } finally {
      setDayLoading(false);
    }
  }

  /* ── Calendar grid ── */

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const firstDayOffset = getMondayBasedDay(monthStart);
    const paddedDays: (Date | null)[] = [];

    for (let i = 0; i < firstDayOffset; i++) {
      paddedDays.push(null);
    }
    for (const day of daysInMonth) {
      paddedDays.push(day);
    }

    return paddedDays;
  }, [currentMonth]);

  /* ── Day status helpers ── */

  function getDayStatus(date: Date): 'fullyBooked' | 'available' | 'past' | 'hasSlots' {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isPast = isBefore(startOfDay(date), startOfDay(new Date()));

    if (isPast) return 'past';
    if (availability?.fullyBooked.includes(dateStr)) return 'fullyBooked';

    const disabledSlots = availability?.disabledSlots[dateStr];
    if (disabledSlots && disabledSlots.length > 0) return 'hasSlots';

    return 'available';
  }

  function getDayDotColor(status: string) {
    switch (status) {
      case 'fullyBooked':
        return 'bg-red-500';
      case 'past':
        return 'bg-gray-400';
      case 'hasSlots':
        return 'bg-amber-500';
      case 'available':
        return 'bg-emerald-500';
      default:
        return 'bg-emerald-500';
    }
  }

  /* ── Handlers ── */

  function handlePrevMonth() {
    setLoading(true);
    setCurrentMonth((prev) => subMonths(prev, 1));
  }

  function handleNextMonth() {
    setLoading(true);
    setCurrentMonth((prev) => addMonths(prev, 1));
  }

  function handleDayClick(date: Date | null) {
    if (!date) return;
    setSelectedDate(date);
    setDialogOpen(true);
    fetchDayBookings(date);
  }

  /* ── Render ── */

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Calendar Header */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevMonth}
              className="shrink-0"
              aria-label="Mois précédent"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-bold capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: fr })}
              </h2>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              className="shrink-0"
              aria-label="Mois suivant"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Disponible</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Créneaux partiels</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Complet</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
              <span>Passé</span>
            </div>
          </div>

          {/* Day Names Header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2">
            {DAY_NAMES.map((name) => (
              <div
                key={name}
                className="text-center text-xs sm:text-sm font-semibold text-muted-foreground py-2"
              >
                {name}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              <AnimatePresence mode="popLayout">
                {calendarDays.map((date, idx) => {
                  if (!date) {
                    return (
                      <motion.div
                        key={`empty-${idx}`}
                        className="aspect-square"
                      />
                    );
                  }

                  const today = isToday(date);
                  const inCurrentMonth = isSameMonth(date, currentMonth);
                  const dayStatus = getDayStatus(date);
                  const dotColor = getDayDotColor(dayStatus);
                  const isPast = dayStatus === 'past';

                  return (
                    <motion.button
                      key={format(date, 'yyyy-MM-dd')}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2, delay: idx * 0.01 }}
                      onClick={() => handleDayClick(date)}
                      disabled={isPast}
                      className={`
                        aspect-square flex flex-col items-center justify-center gap-1 rounded-lg
                        transition-colors duration-150 text-sm sm:text-base
                        ${
                          today
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : isPast
                              ? 'opacity-40 cursor-not-allowed'
                              : inCurrentMonth
                                ? 'hover:bg-muted cursor-pointer'
                                : 'opacity-30 cursor-not-allowed'
                        }
                        ${dayStatus === 'fullyBooked' && !today ? 'bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50' : ''}
                      `}
                      aria-label={`
                        ${format(date, 'd MMMM yyyy', { locale: fr })}
                        ${dayStatus === 'fullyBooked' ? ' - Complet' : ''}
                        ${dayStatus === 'available' ? ' - Disponible' : ''}
                        ${dayStatus === 'hasSlots' ? ' - Créneaux partiels' : ''}
                        ${dayStatus === 'past' ? ' - Passé' : ''}
                      `}
                    >
                      <span className={`font-medium ${today ? 'font-bold' : ''}`}>
                        {format(date, 'd')}
                      </span>
                      {inCurrentMonth && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${dotColor} ${today ? 'bg-primary-foreground' : ''}`}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Day Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              {selectedDate &&
                format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </DialogTitle>
          </DialogHeader>

          {dayLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : dayBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CalendarDays className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">Aucune réservation pour ce jour</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Users className="w-4 h-4" />
                <span>{dayBookings.length} réservation{dayBookings.length > 1 ? 's' : ''}</span>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {dayBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="bg-primary/10 p-2.5 rounded-xl shrink-0">
                            <Clock className="w-5 h-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">
                              {booking.customerName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {booking.customerPhone}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                          <span className="text-sm font-mono font-medium">
                            {booking.timeSlot}
                          </span>
                          {statusBadge(booking.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
