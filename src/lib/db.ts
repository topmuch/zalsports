// Simple in-memory booking store (no Prisma needed for Turbopack compatibility)

export interface Booking {
  id: string;
  date: string;
  timeSlot: string;
  customerName: string;
  customerPhone: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  amount: number;
  depositPaid: number;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  phone: string;
  name: string;
  email: string;
  notifications: boolean;
}

const bookings: Map<string, Booking> = new Map();
const userProfiles: Map<string, UserProfile> = new Map();

// Available slots config: date -> array of available hour strings (e.g. ["08:00", "09:00", ...])
// If a date has no entry, all hours 8-23 are available
const slotConfig: Map<string, string[]> = new Map();

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// Seed sample bookings for dashboard demo
function seedIfEmpty() {
  if (bookings.size > 0) return;
  const names = [
    'Moussa Diallo', 'Amadou Ndiaye', 'Ibrahima Fall', 'Ousmane Sy',
    'Mamadou Diop', 'Cheikh Mbaye', 'Abdoulaye Ba', 'Pape Gueye',
    'Malick Sarr', 'Ismaila Cissé', 'Boubacar Touré', 'Modou Faye',
    'Souleymane Dia', 'Assane Ndong', 'Lamine Camara', 'Omar Seck',
    'Adama Thiaw', 'Babacar Kane', 'Moustapha Lo', 'Serigne Sow',
  ];
  const phones = [
    '+221 77 123 45 67', '+221 78 234 56 78', '+221 76 345 67 89',
    '+221 77 456 78 90', '+221 78 567 89 01', '+221 76 678 90 12',
    '+221 77 789 01 23', '+221 78 890 12 34', '+221 76 901 23 45',
    '+221 77 012 34 56', '+221 78 111 22 33', '+221 76 222 33 44',
    '+221 77 333 44 55', '+221 78 444 55 66', '+221 76 555 66 77',
    '+221 77 666 77 88', '+221 78 777 88 99', '+221 76 888 99 00',
    '+221 77 999 00 11', '+221 78 000 11 22',
  ];
  const slots: string[] = [];
  for (let h = 8; h <= 23; h++) slots.push(`${h.toString().padStart(2, '0')}:00`);
  const statuses: Booking['status'][] = ['confirmed', 'completed', 'cancelled'];
  const paymentStatuses: Booking['paymentStatus'][] = ['unpaid', 'partial', 'paid'];

  const now = new Date();
  let ni = 0;

  // Generate bookings for the last 14 days
  for (let d = 13; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];
    const count = 3 + Math.floor(Math.random() * 5);
    const daySlots = [...slots].sort(() => Math.random() - 0.5).slice(0, count);
    for (const slot of daySlots) {
      const status = d === 0 ? 'confirmed' : statuses[Math.floor(Math.random() * 3)];
      const payStatus = status === 'cancelled' ? 'unpaid' : paymentStatuses[Math.floor(Math.random() * 3)];
      const created = new Date(date);
      created.setHours(parseInt(slot), 0, 0, 0);
      const id = generateId() + ni;
      bookings.set(id, {
        id, date: dateStr, timeSlot: slot,
        customerName: names[ni % names.length],
        customerPhone: phones[ni % phones.length],
        status, paymentStatus: payStatus,
        amount: 25000, depositPaid: payStatus === 'paid' ? 25000 : payStatus === 'partial' ? 5000 : 0,
        createdAt: created.toISOString(), updatedAt: created.toISOString(),
      });
      ni++;
    }
  }

  // Future bookings
  for (let d = 1; d <= 7; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().split('T')[0];
    const count = 2 + Math.floor(Math.random() * 4);
    const daySlots = [...slots].sort(() => Math.random() - 0.5).slice(0, count);
    for (const slot of daySlots) {
      const payStatus = paymentStatuses[Math.floor(Math.random() * 3)];
      const created = new Date();
      const id = generateId() + ni;
      bookings.set(id, {
        id, date: dateStr, timeSlot: slot,
        customerName: names[ni % names.length],
        customerPhone: phones[ni % phones.length],
        status: 'confirmed', paymentStatus: payStatus,
        amount: 25000, depositPaid: payStatus === 'paid' ? 25000 : payStatus === 'partial' ? 5000 : 0,
        createdAt: created.toISOString(), updatedAt: created.toISOString(),
      });
      ni++;
    }
  }

  // Seed a demo user profile for phone +221 77 123 45 67
  userProfiles.set('+221 77 123 45 67', {
    phone: '+221 77 123 45 67',
    name: 'Moussa Diallo',
    email: 'moussa.diallo@email.com',
    notifications: true,
  });
}

seedIfEmpty();

export const db = {
  booking: {
    findFirst: async (where: { date: string; timeSlot: string; status: string }) => {
      for (const b of bookings.values()) {
        if (b.date === where.date && b.timeSlot === where.timeSlot && b.status === where.status) return b;
      }
      return null;
    },
    findMany: async (args?: {
      where?: { date?: string; status?: string; customerPhone?: string; paymentStatus?: string; dateGte?: string; dateLte?: string };
      orderBy?: { createdAt?: string; date?: string };
      take?: number;
    }) => {
      let result = Array.from(bookings.values());
      const w = args?.where;
      if (w?.date) result = result.filter(b => b.date === w.date);
      if (w?.customerPhone) result = result.filter(b => b.customerPhone === w.customerPhone);
      if (w?.status) result = result.filter(b => b.status === w.status);
      if (w?.paymentStatus) result = result.filter(b => b.paymentStatus === w.paymentStatus);
      if (w?.dateGte) result = result.filter(b => b.date >= w.dateGte);
      if (w?.dateLte) result = result.filter(b => b.date <= w.dateLte);
      if (args?.orderBy?.createdAt === 'desc') result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      if (args?.orderBy?.date === 'asc') result.sort((a, b) => a.date.localeCompare(b.date) || a.timeSlot.localeCompare(b.timeSlot));
      if (args?.take) result = result.slice(0, args.take);
      return result;
    },
    findUnique: async (where: { id: string }) => {
      return bookings.get(where.id) || null;
    },
    create: async (data: { date: string; timeSlot: string; customerName: string; customerPhone: string; status?: Booking['status'] }) => {
      const id = generateId();
      const now = new Date().toISOString();
      const booking: Booking = {
        id, date: data.date, timeSlot: data.timeSlot,
        customerName: data.customerName, customerPhone: data.customerPhone,
        status: data.status || 'pending', paymentStatus: 'unpaid',
        amount: 25000, depositPaid: 0,
        createdAt: now, updatedAt: now,
      };
      bookings.set(id, booking);
      return booking;
    },
    update: async (where: { id: string }, data: { status?: string; paymentStatus?: string; paymentMethod?: string; depositPaid?: number }) => {
      const booking = bookings.get(where.id);
      if (!booking) return null;
      if (data.status) booking.status = data.status as Booking['status'];
      if (data.paymentStatus) booking.paymentStatus = data.paymentStatus as Booking['paymentStatus'];
      if (data.paymentMethod) booking.paymentMethod = data.paymentMethod;
      if (data.depositPaid !== undefined) booking.depositPaid = data.depositPaid;
      booking.updatedAt = new Date().toISOString();
      return booking;
    },
    count: async (args?: { where?: { date?: string; status?: string; customerPhone?: string } }) => {
      let result = Array.from(bookings.values());
      if (args?.where?.date) result = result.filter(b => b.date === args.where.date);
      if (args?.where?.status) result = result.filter(b => b.status === args.where.status);
      if (args?.where?.customerPhone) result = result.filter(b => b.customerPhone === args.where.customerPhone);
      return result.length;
    },
    getCalendarMonth: async (year: number, month: number, phone?: string) => {
      const all = Array.from(bookings.values());
      const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
      let filtered = all.filter(b => b.date.startsWith(monthStr) && b.status !== 'cancelled');
      if (phone) filtered = filtered.filter(b => b.customerPhone === phone);
      // Group by date
      const byDate: Record<string, Booking[]> = {};
      for (const b of filtered) {
        if (!byDate[b.date]) byDate[b.date] = [];
        byDate[b.date].push(b);
      }
      return byDate;
    },
    getStats: async () => {
      const all = Array.from(bookings.values());
      const today = new Date().toISOString().split('T')[0];
      const todayBookings = all.filter(b => b.date === today);
      const confirmed = all.filter(b => b.status === 'confirmed' || b.status === 'completed');
      const totalRevenue = confirmed.filter(b => b.paymentStatus === 'paid').length * 25000 +
        confirmed.filter(b => b.paymentStatus === 'partial').length * 5000;
      const todayRevenue = todayBookings.filter(b => (b.status === 'confirmed' || b.status === 'completed') && b.paymentStatus !== 'unpaid').length * 25000;

      const hourlyDist: Record<string, number> = {};
      for (let h = 8; h <= 23; h++) hourlyDist[`${h.toString().padStart(2, '0')}:00`] = 0;
      for (const b of confirmed) hourlyDist[b.timeSlot] = (hourlyDist[b.timeSlot] || 0) + 1;

      const dailyDist: { date: string; count: number; revenue: number }[] = [];
      for (let d = 6; d >= 0; d--) {
        const date = new Date(); date.setDate(date.getDate() - d);
        const dateStr = date.toISOString().split('T')[0];
        const dayBookings = confirmed.filter(b => b.date === dateStr);
        dailyDist.push({ date: dateStr, count: dayBookings.length, revenue: dayBookings.length * 25000 });
      }

      const totalSlots = 16;
      const bookedToday = todayBookings.filter(b => b.status !== 'cancelled').length;
      const occupancyRate = totalSlots > 0 ? Math.round((bookedToday / totalSlots) * 100) : 0;

      const upcoming = all
        .filter(b => b.date >= today && b.status === 'confirmed')
        .sort((a, b) => a.date.localeCompare(b.date) || a.timeSlot.localeCompare(b.timeSlot))
        .slice(0, 10);

      return {
        totalBookings: all.length,
        todayBookings: todayBookings.filter(b => b.status !== 'cancelled').length,
        totalRevenue, todayRevenue, occupancyRate,
        confirmedCount: confirmed.length,
        cancelledCount: all.filter(b => b.status === 'cancelled').length,
        completedCount: all.filter(b => b.status === 'completed').length,
        pendingCount: all.filter(b => b.status === 'pending').length,
        hourlyDistribution: hourlyDist,
        dailyDistribution: dailyDist,
        upcomingBookings: upcoming,
        recentBookings: [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 15),
      };
    },
  },
  user: {
    find: async (phone: string) => {
      return userProfiles.get(phone) || null;
    },
    upsert: async (data: { phone: string; name: string; email: string; notifications: boolean }) => {
      userProfiles.set(data.phone, { ...data });
      return userProfiles.get(data.phone)!;
    },
  },
  slots: {
    /** Get available hours for a date. Returns null if no custom config (meaning all hours 8-23). */
    getConfig: async (date: string) => {
      return slotConfig.get(date) || null;
    },
    /** Set available hours for a date. Pass empty array to close all slots. */
    setConfig: async (date: string, hours: string[]) => {
      if (hours.length === 0) {
        slotConfig.delete(date);
      } else {
        slotConfig.set(date, [...hours].sort());
      }
      return slotConfig.get(date) || [];
    },
    /** Get all dates that have custom config */
    getAllConfigs: async () => {
      const result: Record<string, string[]> = {};
      for (const [date, hours] of slotConfig.entries()) {
        result[date] = hours;
      }
      return result;
    },
    /** Toggle a specific hour for a date */
    toggleHour: async (date: string, hour: string) => {
      const current = slotConfig.get(date);
      if (!current) {
        // Initialize with all default hours EXCEPT the one being toggled off
        const allHours: string[] = [];
        for (let h = 8; h <= 23; h++) {
          const hStr = `${h.toString().padStart(2, '0')}:00`;
          if (hStr !== hour) allHours.push(hStr);
        }
        slotConfig.set(date, allHours);
      } else {
        const idx = current.indexOf(hour);
        if (idx >= 0) {
          current.splice(idx, 1);
          if (current.length === 0) slotConfig.delete(date);
        } else {
          current.push(hour);
          current.sort();
        }
      }
      return slotConfig.get(date) || null;
    },
  },
};
