'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import {
  CalendarCheck,
  DollarSign,
  Clock,
  Users,
  BarChart3,
  Activity,
  Phone,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { fr } from 'date-fns/locale';

/* ── Types ── */

interface DashboardStats {
  totalBookings: number;
  todayBookings: number;
  totalRevenue: number;
  todayRevenue: number;
  occupancyRate: number;
  confirmedCount: number;
  cancelledCount: number;
  completedCount: number;
  hourlyDistribution: Record<string, number>;
  dailyDistribution: { date: string; count: number; revenue: number }[];
  upcomingBookings: BookingRow[];
  recentBookings: BookingRow[];
}

interface BookingRow {
  id: string;
  date: string;
  timeSlot: string;
  customerName: string;
  customerPhone: string;
  status: string;
  createdAt: string;
}

/* ── Chart Config ── */

const chartGreen = 'oklch(0.55 0.19 145)';

const hourlyChartConfig = {
  count: { label: 'Réservations', color: chartGreen },
} satisfies ChartConfig;

const dailyChartConfig = {
  revenue: { label: 'Revenus (FCFA)', color: chartGreen },
} satisfies ChartConfig;

/* ── Helpers ── */

function formatMoney(n: number): string {
  return n.toLocaleString('fr-FR') + ' FCFA';
}

function formatDateRelative(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Aujourd'hui";
  if (isTomorrow(date)) return 'Demain';
  return format(date, 'dd MMM', { locale: fr });
}

function statusBadge(status: string) {
  switch (status) {
    case 'confirmed':
      return <Badge className="bg-primary/15 text-primary border-primary/30 hover:bg-primary/20">Confirmé</Badge>;
    case 'completed':
      return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20">Terminé</Badge>;
    case 'cancelled':
      return <Badge className="bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/20">Annulé</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

/* ── KPI Card ── */

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{title}</p>
            <p className="text-2xl font-bold tabular-nums">{value}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── StatsTab ── */

export default function StatsTab() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'recent'>('upcoming');

  const token = typeof window !== 'undefined' ? localStorage.getItem('zalsports_admin_token') : null;

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) setStats(await res.json());
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleCancel = useCallback(async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchStats();
    } catch { /* silent */ }
  }, [token, fetchStats]);

  const handleComplete = useCallback(async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'completed' }),
      });
      if (res.ok) fetchStats();
    } catch { /* silent */ }
  }, [token, fetchStats]);

  const hourlyData = stats
    ? Object.entries(stats.hourlyDistribution)
        .map(([time, count]) => ({ time: time.replace(':00', 'h'), count }))
        .filter((d) => d.count > 0)
    : [];

  const dailyData = stats
    ? stats.dailyDistribution.map((d) => ({
        ...d,
        day: format(parseISO(d.date), 'EEE d', { locale: fr }),
      }))
    : [];

  const displayedBookings = tab === 'upcoming' ? stats?.upcomingBookings || [] : stats?.recentBookings || [];

  if (loading && !stats) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[120px] rounded-2xl bg-card border border-border animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[300px] rounded-2xl bg-card border border-border animate-pulse" />
          <div className="h-[300px] rounded-2xl bg-card border border-border animate-pulse" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="stats-content"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.35 }}
        className="p-6 space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Tableau de bord</h1>
            <p className="text-muted-foreground mt-1 text-sm">Vue d&rsquo;ensemble de votre activité</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Actualiser
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Aujourd'hui"
            value={stats.todayBookings.toString()}
            subtitle="Créneaux confirmés"
            icon={CalendarCheck}
          />
          <KpiCard
            title="Revenus totaux"
            value={formatMoney(stats.totalRevenue)}
            subtitle={formatMoney(stats.todayRevenue) + " aujourd'hui"}
            icon={DollarSign}
          />
          <KpiCard
            title="Taux d'occupation"
            value={stats.occupancyRate + '%'}
            subtitle={`${stats.completedCount} terminées · ${stats.cancelledCount} annulées`}
            icon={Activity}
          />
          <KpiCard
            title="Total réservations"
            value={stats.totalBookings.toLocaleString('fr-FR')}
            subtitle={`${stats.confirmedCount} en cours`}
            icon={Users}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Revenus — 7 derniers jours</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer config={dailyChartConfig} className="h-[220px] w-full">
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartGreen} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartGreen} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.005 150)" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'oklch(0.48 0.02 150)' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'oklch(0.48 0.02 150)' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="revenue" stroke={chartGreen} fill="url(#fillRevenue)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Hourly Chart */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Heures les plus réservées</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer config={hourlyChartConfig} className="h-[220px] w-full">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.005 150)" />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'oklch(0.48 0.02 150)' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'oklch(0.48 0.02 150)' }} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill={chartGreen} radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Table */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-sm font-semibold">
                {tab === 'upcoming' ? 'Prochaines réservations' : 'Réservations récentes'}
              </CardTitle>
              <div className="flex bg-secondary rounded-lg p-0.5">
                <button
                  onClick={() => setTab('upcoming')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    tab === 'upcoming' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  À venir
                </button>
                <button
                  onClick={() => setTab('recent')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    tab === 'recent' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Récentes
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-xs">Client</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Créneau</TableHead>
                    <TableHead className="text-xs">Statut</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground text-sm">
                        Aucune réservation trouvée.
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedBookings.map((b) => (
                      <TableRow key={b.id} className="border-border/30">
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{b.customerName}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {b.customerPhone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{formatDateRelative(b.date)}</p>
                            <p className="text-xs text-muted-foreground">{format(parseISO(b.date), 'dd MMM yyyy', { locale: fr })}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-mono">{b.timeSlot}</TableCell>
                        <TableCell>{statusBadge(b.status)}</TableCell>
                        <TableCell className="text-right">
                          {b.status === 'confirmed' && (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost" size="sm" className="h-7 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                                onClick={() => handleComplete(b.id)} title="Marquer terminé"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost" size="sm" className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleCancel(b.id)} title="Annuler"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
