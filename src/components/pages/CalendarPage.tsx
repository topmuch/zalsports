'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CalendarDays,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Banknote,
  CreditCard,
  Smartphone,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import PageLayout from './PageLayout';

interface BookingItem {
  id: string;
  date: string;
  timeSlot: string;
  customerName: string;
  customerPhone: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
}

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function PaymentIcon({ method }: { method?: string }) {
  if (method === 'wave') return <Smartphone className="w-3.5 h-3.5 text-emerald-500" />;
  if (method === 'orange_money') return <Smartphone className="w-3.5 h-3.5 text-orange-500" />;
  if (method === 'cash') return <Banknote className="w-3.5 h-3.5 text-foreground" />;
  return <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />;
}

function PaymentLabel({ method }: { method?: string }) {
  if (method === 'wave') return 'Wave';
  if (method === 'orange_money') return 'Orange Money';
  if (method === 'cash') return 'Espèces';
  return '—';
}

export default function CalendarPage({ onBack }: { onBack: () => void }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings/upcoming');
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    const map: Record<string, BookingItem[]> = {};
    for (const b of bookings) {
      if (!map[b.date]) map[b.date] = [];
      map[b.date].push(b);
    }
    // Sort each day's bookings by time
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
    }
    return map;
  }, [bookings]);

  // Calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    // Pad start to Monday
    const startDay = monthStart.getDay();
    const padStart = startDay === 0 ? 6 : startDay - 1;
    const padDays: Date[] = [];
    for (let i = padStart - 1; i >= 0; i--) {
      const d = new Date(monthStart);
      d.setDate(d.getDate() - i - 1);
      padDays.push(d);
    }
    return [...padDays, ...days];
  }, [currentMonth]);

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const selectedBookings = selectedDateStr ? (bookingsByDate[selectedDateStr] || []) : [];

  // Also show today's bookings by default
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayBookings = bookingsByDate[todayStr] || [];

  return (
    <PageLayout
      title="Calendrier des réservations"
      subtitle="Toutes les réservations à venir sur le terrain"
      onBack={onBack}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ─── Calendar Grid ─── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-border p-4 sm:p-6">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-lg font-bold capitalize">
                  {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const dayBookings = bookingsByDate[dateStr] || [];
                  const count = dayBookings.length;
                  const inMonth = isSameMonth(day, currentMonth);
                  const isPastDay = isBefore(day, startOfDay(new Date()));
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isTodayDay = isToday(day);

                  return (
                    <button
                      key={i}
                      disabled={isPastDay}
                      onClick={() => setSelectedDate(isSelected ? null : day)}
                      className={`
                        relative flex flex-col items-center justify-center py-2 sm:py-3 rounded-xl text-sm transition-all
                        ${!inMonth ? 'text-muted-foreground/30 cursor-default' : ''}
                        ${isPastDay && inMonth ? 'text-muted-foreground/30 cursor-not-allowed' : ''}
                        ${!inMonth || isPastDay ? '' : 'hover:bg-secondary cursor-pointer'}
                        ${isSelected ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' : ''}
                        ${isTodayDay && !isSelected ? 'bg-primary/10 font-bold text-primary' : ''}
                        ${inMonth && !isPastDay && !isSelected && !isTodayDay ? 'text-foreground' : ''}
                      `}
                    >
                      <span className="text-sm font-medium">{format(day, 'd')}</span>
                      {count > 0 && inMonth && !isPastDay && (
                        <span className={`mt-0.5 flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                          isSelected ? 'bg-primary-foreground/30 text-primary-foreground' : 'bg-primary text-primary-foreground'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span>Réservation(s)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-primary/10 border border-primary/30" />
                  <span>Aujourd'hui</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Sidebar: Selected day details or Today ─── */}
          <div className="lg:col-span-1">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            ) : (
              <>
                {/* Selected date bookings */}
                {selectedDate && selectedBookings.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
                    </h3>
                    <div className="space-y-3">
                      {selectedBookings.map(b => (
                        <div key={b.id} className="bg-white rounded-xl border border-border p-4 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <Badge variant={b.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                              {b.status === 'confirmed' ? 'Confirmé' : b.status === 'pending' ? 'En attente' : b.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <PaymentIcon method={b.paymentMethod} />
                              <PaymentLabel method={b.paymentMethod} />
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span className="font-semibold">{b.timeSlot} – {(() => { const h = parseInt(b.timeSlot); return `${(h + 1).toString().padStart(2, '0')}:00`; })()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="w-3.5 h-3.5" />
                            <span>{b.customerName}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDate && selectedBookings.length === 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
                    </h3>
                    <div className="bg-white rounded-xl border border-border p-8 text-center">
                      <p className="text-sm text-muted-foreground">Aucune réservation ce jour</p>
                    </div>
                  </div>
                )}

                {/* Today's upcoming bookings */}
                {todayBookings.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Aujourd'hui — {todayBookings.length} réservation{todayBookings.length > 1 ? 's' : ''}
                    </h3>
                    <div className="space-y-3">
                      {todayBookings.map(b => (
                        <div key={b.id} className="bg-primary/5 rounded-xl border border-primary/20 p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                              <Clock className="w-4 h-4" />
                              {b.timeSlot}
                            </div>
                            <Badge className="bg-primary text-primary-foreground text-xs">Aujourd'hui</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="w-3.5 h-3.5" />
                            {b.customerName}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary stats */}
                <div className="mt-6 bg-secondary/40 rounded-xl p-5 space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Résumé
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 text-center border border-border">
                      <p className="text-2xl font-extrabold text-primary">{bookings.length}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Réservations à venir</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border border-border">
                      <p className="text-2xl font-extrabold text-primary">
                        {new Set(bookings.map(b => b.date)).size}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">Jours occupés</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
