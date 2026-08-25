'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  Clock,
  Phone,
  Loader2,
  X,
  Settings2,
  List,
  CheckCheck,
  XCircle,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import { fr } from 'date-fns/locale';

/* ── Types ── */

interface CalendarBooking {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  timeSlot: string;
  status: string;
}

interface DayBookings {
  [date: string]: CalendarBooking[];
}

interface SlotConfig {
  date: string;
  availableHours: string[];
  isCustom: boolean;
}

/* ── Helpers ── */

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('zalsports_admin_token');
}

function statusDot(status: string) {
  switch (status) {
    case 'confirmed':
      return 'bg-primary';
    case 'completed':
      return 'bg-emerald-500';
    case 'cancelled':
      return 'bg-destructive';
    default:
      return 'bg-amber-500';
  }
}

/** Generate all hours from 08:00 to 23:00 */
function getAllHours(): string[] {
  const hours: string[] = [];
  for (let h = 8; h <= 23; h++) {
    hours.push(`${String(h).padStart(2, '0')}:00`);
  }
  return hours;
}

const ALL_HOURS = getAllHours();

/* ── Component ── */

export default function CalendarTab() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dayBookings, setDayBookings] = useState<DayBookings>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedBookings, setSelectedBookings] = useState<CalendarBooking[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDate, setAddDate] = useState('');
  const [form, setForm] = useState({ customerName: '', customerPhone: '', timeSlot: '' });
  const [submitting, setSubmitting] = useState(false);

  // Slot management state
  const [sideTab, setSideTab] = useState<'bookings' | 'slots'>('bookings');
  const [slotConfig, setSlotConfig] = useState<SlotConfig | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [togglingHour, setTogglingHour] = useState<string | null>(null);

  // Track which dates have custom config (for badge display)
  const [customDates, setCustomDates] = useState<Set<string>>(new Set());

  // ── Calendar bookings fetch ──
  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const res = await fetch(
        `/api/admin/bookings/calendar?year=${year}&month=${month}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (res.ok) {
        const data = await res.json();
        setDayBookings(data.bookings || {});
      } else {
        // Prisma tables might not exist — show empty
        setDayBookings({});
      }
    } catch {
      setDayBookings({});
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  // ── Slot config fetch for selected date ──
  const fetchSlotConfig = useCallback(async (dateStr: string) => {
    setSlotsLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`/api/admin/slots?date=${dateStr}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data: SlotConfig = await res.json();
        setSlotConfig(data);
        // Track custom dates for badge
        if (data.isCustom) {
          setCustomDates((prev) => {
            const next = new Set(prev);
            next.add(data.date);
            return next;
          });
        } else {
          setCustomDates((prev) => {
            const next = new Set(prev);
            next.delete(data.date);
            return next;
          });
        }
      }
    } catch {
      // silent — leave default state
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  // ── Toggle a single hour ──
  const toggleHour = useCallback(
    async (hour: string) => {
      if (!selectedDate) return;
      setTogglingHour(hour);
      try {
        const token = getToken();
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const res = await fetch('/api/admin/slots', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ date: dateStr, hour }),
        });
        if (res.ok) {
          const data: SlotConfig = await res.json();
          setSlotConfig(data);
          if (data.isCustom) {
            setCustomDates((prev) => {
              const next = new Set(prev);
              next.add(data.date);
              return next;
            });
          } else {
            setCustomDates((prev) => {
              const next = new Set(prev);
              next.delete(data.date);
              return next;
            });
          }
        }
      } catch {
        // silent
      } finally {
        setTogglingHour(null);
      }
    },
    [selectedDate]
  );

  // ── Toggle all hours (select all / deselect all) ──
  const toggleAllHours = useCallback(
    async (select: boolean) => {
      if (!selectedDate) return;
      setSlotsLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const token = getToken();

      // Determine which hours need toggling
      const currentAvailable = slotConfig?.availableHours || (select ? [] : ALL_HOURS);
      const hoursToToggle = select
        ? ALL_HOURS.filter((h) => !currentAvailable.includes(h))
        : currentAvailable;

      try {
        // Fire all toggle requests (sequentially to avoid race conditions)
        let latestConfig: SlotConfig | null = null;
        for (const hour of hoursToToggle) {
          const res = await fetch('/api/admin/slots', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ date: dateStr, hour }),
          });
          if (res.ok) {
            latestConfig = await res.json();
          }
        }
        if (latestConfig) {
          setSlotConfig(latestConfig);
          if (latestConfig.isCustom) {
            setCustomDates((prev) => {
              const next = new Set(prev);
              next.add(latestConfig!.date);
              return next;
            });
          } else {
            setCustomDates((prev) => {
              const next = new Set(prev);
              next.delete(latestConfig!.date);
              return next;
            });
          }
        }
      } catch {
        // silent
      } finally {
        setSlotsLoading(false);
      }
    },
    [selectedDate, slotConfig]
  );

  // ── Derived: whether all hours are active ──
  const allHoursActive = useMemo(() => {
    if (!slotConfig) return false;
    return ALL_HOURS.every((h) => slotConfig.availableHours.includes(h));
  }, [slotConfig]);

  // ── Derived: whether no hours are active ──
  const noHoursActive = useMemo(() => {
    if (!slotConfig) return false;
    return slotConfig.availableHours.length === 0;
  }, [slotConfig]);

  // ── Calendar grid computation ──
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let dayIter = calendarStart;
  while (dayIter <= calendarEnd) {
    days.push(dayIter);
    dayIter = addDays(dayIter, 1);
  }

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const handleDayClick = (date: Date) => {
    const key = format(date, 'yyyy-MM-dd');
    const isAlreadySelected = selectedDate && isSameDay(date, selectedDate);

    if (isAlreadySelected) {
      // Deselect
      setSelectedDate(null);
      setSelectedBookings([]);
      setSlotConfig(null);
      setSideTab('bookings');
      return;
    }

    setSelectedDate(date);
    setSelectedBookings(dayBookings[key] || []);
    setSideTab('bookings');
    setSlotConfig(null);
    // Fetch slot config in background
    fetchSlotConfig(key);
  };

  const handleAddForDate = (date: Date) => {
    setAddDate(format(date, 'yyyy-MM-dd'));
    setForm({ customerName: '', customerPhone: '', timeSlot: '' });
    setAddDialogOpen(true);
  };

  const handleAdd = async () => {
    if (!form.customerName || !form.customerPhone || !form.timeSlot || !addDate) return;
    setSubmitting(true);
    try {
      const token = getToken();
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...form, date: addDate }),
      });
      if (res.ok) {
        setAddDialogOpen(false);
        fetchCalendar();
        // Refresh selected day bookings
        const key = addDate;
        setSelectedBookings((prev) => {
          const existing = dayBookings[key] || [];
          return [...existing, { id: 'new', ...form, date: addDate, status: 'confirmed' }];
        });
      }
    } catch {
      /* silent */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="calendar-content"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.35 }}
        className="p-6 space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Calendrier</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Vue mensuelle des réservations et créneaux disponibles
            </p>
          </div>
          <Button onClick={() => handleAddForDate(new Date())}>
            <Plus className="w-4 h-4 mr-1.5" /> Ajouter
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <CardTitle className="text-sm font-semibold capitalize">
                    {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Week day headers */}
                <div className="grid grid-cols-7 mb-1">
                  {weekDays.map((wd) => (
                    <div
                      key={wd}
                      className="text-center text-xs font-medium text-muted-foreground py-2"
                    >
                      {wd}
                    </div>
                  ))}
                </div>
                {/* Day cells */}
                <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                  {days.map((d, i) => {
                    const key = format(d, 'yyyy-MM-dd');
                    const bookings = dayBookings[key] || [];
                    const count = bookings.length;
                    const inMonth = isSameMonth(d, currentMonth);
                    const today = isToday(d);
                    const isSelected = selectedDate && isSameDay(d, selectedDate);
                    const isCustom = customDates.has(key);

                    return (
                      <button
                        key={i}
                        onClick={() => inMonth && handleDayClick(d)}
                        onDoubleClick={() => inMonth && handleAddForDate(d)}
                        disabled={!inMonth}
                        className={`relative min-h-[80px] sm:min-h-[90px] p-2 text-left transition-colors bg-card hover:bg-accent/50 disabled:opacity-30 disabled:cursor-default
                          ${isSelected ? 'ring-2 ring-primary ring-inset bg-primary/5' : ''}
                          ${today ? 'bg-primary/5' : ''}
                        `}
                      >
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-xs font-medium ${today ? 'text-primary' : ''}`}
                          >
                            {format(d, 'd')}
                          </span>
                          {isCustom && inMonth && (
                            <Badge
                              variant="outline"
                              className="h-3.5 px-1 text-[8px] font-bold bg-amber-500/10 text-amber-600 border-amber-500/30 leading-none"
                            >
                              ⚙
                            </Badge>
                          )}
                        </div>
                        {count > 0 && (
                          <div className="mt-1 flex flex-wrap gap-0.5">
                            {bookings.slice(0, 3).map((b) => (
                              <div
                                key={b.id}
                                className={`w-1.5 h-1.5 rounded-full ${statusDot(b.status)}`}
                                title={`${b.customerName} - ${b.timeSlot}`}
                              />
                            ))}
                            {count > 3 && (
                              <span className="text-[9px] text-muted-foreground leading-none">
                                +{count - 3}
                              </span>
                            )}
                          </div>
                        )}
                        {count > 0 && (
                          <div className="absolute bottom-1 right-1.5">
                            <Badge
                              variant="secondary"
                              className="h-4 px-1 text-[9px] font-bold"
                            >
                              {count}
                            </Badge>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side panel: Tabs – Bookings / Slots */}
          <div>
            <Card className="bg-card border-border sticky top-6">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    {selectedDate
                      ? format(selectedDate, 'dd MMMM yyyy', { locale: fr })
                      : 'Sélectionnez un jour'}
                  </CardTitle>
                  {selectedDate && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        setSelectedDate(null);
                        setSelectedBookings([]);
                        setSlotConfig(null);
                        setSideTab('bookings');
                      }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>

                {/* Tabs */}
                {selectedDate && (
                  <div className="flex gap-1 mt-2">
                    <button
                      onClick={() => setSideTab('bookings')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                        ${
                          sideTab === 'bookings'
                            ? 'bg-primary/15 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                        }
                      `}
                    >
                      <List className="w-3 h-3" />
                      Réservations
                    </button>
                    <button
                      onClick={() => setSideTab('slots')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                        ${
                          sideTab === 'slots'
                            ? 'bg-primary/15 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                        }
                      `}
                    >
                      <Settings2 className="w-3 h-3" />
                      Créneaux
                    </button>
                  </div>
                )}
              </CardHeader>

              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                ) : !selectedDate ? (
                  <div className="text-center py-8">
                    <CalendarDays className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground">
                      Cliquez sur un jour pour voir les réservations et gérer les créneaux
                    </p>
                  </div>
                ) : sideTab === 'bookings' ? (
                  /* ── Bookings Tab ── */
                  selectedBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-xs text-muted-foreground">
                        Aucune réservation ce jour
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 text-xs"
                        onClick={() => handleAddForDate(selectedDate)}
                      >
                        <Plus className="w-3 h-3 mr-1" /> Ajouter
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                      {selectedBookings.map((b) => (
                        <div
                          key={b.id}
                          className="p-3 rounded-lg border border-border/50 hover:bg-accent/30 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium">{b.customerName}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3" /> {b.customerPhone}
                              </p>
                            </div>
                            <Badge
                              className={`text-[10px] px-1.5 py-0 ${
                                b.status === 'confirmed'
                                  ? 'bg-primary/15 text-primary border-primary/30'
                                  : b.status === 'completed'
                                  ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                                  : 'bg-destructive/15 text-destructive border-destructive/30'
                              }`}
                            >
                              {b.status === 'confirmed'
                                ? 'Confirmé'
                                : b.status === 'completed'
                                ? 'Terminé'
                                : 'Annulé'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" /> {b.timeSlot}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  /* ── Slots Tab ── */
                  <div className="space-y-4">
                    {/* Select all / Deselect all */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        disabled={slotsLoading || allHoursActive}
                        onClick={() => toggleAllHours(true)}
                      >
                        <CheckCheck className="w-3 h-3 mr-1" />
                        Tout sélectionner
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        disabled={slotsLoading || noHoursActive}
                        onClick={() => toggleAllHours(false)}
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Tout désélectionner
                      </Button>
                      {slotsLoading && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary ml-auto" />
                      )}
                    </div>

                    {/* Slot config info */}
                    {slotConfig && (
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            slotConfig.isCustom
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                          }`}
                        >
                          {slotConfig.isCustom ? 'Config personnalisée' : 'Config par défaut'}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {slotConfig.availableHours.length} créneau{slotConfig.availableHours.length !== 1 ? 'x' : ''} disponible{slotConfig.availableHours.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                    {/* Hours grid */}
                    {slotsLoading && !slotConfig ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-1.5 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                        {ALL_HOURS.map((hour) => {
                          const isActive = slotConfig?.availableHours.includes(hour) ?? true;
                          const isToggling = togglingHour === hour;

                          return (
                            <button
                              key={hour}
                              onClick={() => toggleHour(hour)}
                              disabled={slotsLoading}
                              className={`relative flex items-center justify-center rounded-md border px-2 py-2 text-xs font-medium transition-all duration-150
                                ${
                                  isActive
                                    ? 'bg-primary/15 text-primary border-primary/30 hover:bg-primary/25'
                                    : 'bg-secondary/30 text-muted-foreground/50 border-border/50 hover:bg-secondary/50 hover:text-muted-foreground'
                                }
                                ${isToggling ? 'opacity-50' : ''}
                              `}
                            >
                              {isToggling && (
                                <Loader2 className="w-3 h-3 animate-spin absolute" />
                              )}
                              <span className={isToggling ? 'invisible' : ''}>{hour}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Nouvelle réservation —{' '}
                {addDate &&
                  format(parseISO(addDate), 'dd MMM yyyy', { locale: fr })}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Nom du client</Label>
                <Input
                  placeholder="Nom complet"
                  value={form.customerName}
                  onChange={(e) =>
                    setForm({ ...form, customerName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  placeholder="+221 XX XXX XXXX"
                  value={form.customerPhone}
                  onChange={(e) =>
                    setForm({ ...form, customerPhone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Créneau horaire</Label>
                <Input
                  placeholder="ex: 10:00 - 11:00"
                  value={form.timeSlot}
                  onChange={(e) =>
                    setForm({ ...form, timeSlot: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleAdd}
                disabled={
                  submitting ||
                  !form.customerName ||
                  !form.customerPhone ||
                  !form.timeSlot
                }
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Ajouter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </AnimatePresence>
  );
}
