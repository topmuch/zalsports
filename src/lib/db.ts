// Simple in-memory booking store (no Prisma needed for Turbopack compatibility)

export interface Booking {
  id: string;
  date: string;
  timeSlot: string;
  customerName: string;
  customerPhone: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

const bookings: Map<string, Booking> = new Map();

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
  const slots = [];
  for (let h = 8; h <= 23; h++) slots.push(`${h.toString().padStart(2, '0')}:00`);
  const statuses: Booking['status'][] = ['confirmed', 'completed', 'cancelled'];

  // Generate bookings for the last 14 days
  const now = new Date();
  let ni = 0;
  for (let d = 13; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];
    // 3-7 bookings per day
    const count = 3 + Math.floor(Math.random() * 5);
    const daySlots = [...slots].sort(() => Math.random() - 0.5).slice(0, count);
    for (const slot of daySlots) {
      const status = d === 0 ? 'confirmed' : statuses[Math.floor(Math.random() * 3)];
      const created = new Date(date);
      created.setHours(parseInt(slot), 0, 0, 0);
      const id = generateId() + ni;
      bookings.set(id, {
        id,
        date: dateStr,
        timeSlot: slot,
        customerName: names[ni % names.length],
        customerPhone: phones[ni % phones.length],
        status,
        createdAt: created.toISOString(),
        updatedAt: created.toISOString(),
      });
      ni++;
    }
  }
  // Also add a few future bookings
  for (let d = 1; d <= 7; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().split('T')[0];
    const count = 2 + Math.floor(Math.random() * 4);
    const daySlots = [...slots].sort(() => Math.random() - 0.5).slice(0, count);
    for (const slot of daySlots) {
      const created = new Date();
      const id = generateId() + ni;
      bookings.set(id, {
        id,
        date: dateStr,
        timeSlot: slot,
        customerName: names[ni % names.length],
        customerPhone: phones[ni % phones.length],
        status: 'confirmed',
        createdAt: created.toISOString(),
        updatedAt: created.toISOString(),
      });
      ni++;
    }
  }
}

// Auto-seed on module load
seedIfEmpty();

export const db = {
  booking: {
    findFirst: async (where: { date: string; timeSlot: string; status: string }) => {
      for (const b of bookings.values()) {
        if (b.date === where.date && b.timeSlot === where.timeSlot && b.status === where.status) {
          return b;
        }
      }
      return null;
    },
    findMany: async (args?: { where?: { date?: string; status?: string }; orderBy?: { createdAt?: string }; take?: number }) => {
      let result = Array.from(bookings.values());
      if (args?.where?.date) result = result.filter(b => b.date === args.where.date);
      if (args?.where?.status) result = result.filter(b => b.status === args.where.status);
      if (args?.orderBy?.createdAt === 'desc') result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      if (args?.take) result = result.slice(0, args.take);
      return result;
    },
    findUnique: async (where: { id: string }) => {
      return bookings.get(where.id) || null;
    },
    create: async (data: { date: string; timeSlot: string; customerName: string; customerPhone: string }) => {
      const id = generateId();
      const now = new Date().toISOString();
      const booking: Booking = {
        id,
        date: data.date,
        timeSlot: data.timeSlot,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        status: 'confirmed',
        createdAt: now,
        updatedAt: now,
      };
      bookings.set(id, booking);
      return booking;
    },
    update: async (where: { id: string }, data: { status?: string }) => {
      const booking = bookings.get(where.id);
      if (!booking) return null;
      if (data.status) booking.status = data.status as Booking['status'];
      booking.updatedAt = new Date().toISOString();
      return booking;
    },
    count: async (args?: { where?: { date?: string; status?: string } }) => {
      let result = Array.from(bookings.values());
      if (args?.where?.date) result = result.filter(b => b.date === args.where.date);
      if (args?.where?.status) result = result.filter(b => b.status === args.where.status);
      return result.length;
    },
    getStats: async () => {
      const all = Array.from(bookings.values());
      const today = new Date().toISOString().split('T')[0];
      const todayBookings = all.filter(b => b.date === today);
      const confirmed = all.filter(b => b.status === 'confirmed' || b.status === 'completed');
      const totalRevenue = confirmed.length * 25000;
      const todayRevenue = todayBookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length * 25000;

      // Hourly distribution
      const hourlyDist: Record<string, number> = {};
      for (let h = 8; h <= 23; h++) {
        hourlyDist[`${h.toString().padStart(2, '0')}:00`] = 0;
      }
      for (const b of confirmed) {
        hourlyDist[b.timeSlot] = (hourlyDist[b.timeSlot] || 0) + 1;
      }

      // Daily distribution (last 7 days)
      const dailyDist: { date: string; count: number; revenue: number }[] = [];
      for (let d = 6; d >= 0; d--) {
        const date = new Date();
        date.setDate(date.getDate() - d);
        const dateStr = date.toISOString().split('T')[0];
        const dayBookings = confirmed.filter(b => b.date === dateStr);
        dailyDist.push({
          date: dateStr,
          count: dayBookings.length,
          revenue: dayBookings.length * 25000,
        });
      }

      // Occupancy rate today
      const totalSlots = 16; // 08:00 to 23:00
      const bookedToday = todayBookings.filter(b => b.status !== 'cancelled').length;
      const occupancyRate = totalSlots > 0 ? Math.round((bookedToday / totalSlots) * 100) : 0;

      // Upcoming bookings (future confirmed)
      const upcoming = all
        .filter(b => b.date >= today && b.status === 'confirmed')
        .sort((a, b) => a.date.localeCompare(b.date) || a.timeSlot.localeCompare(b.timeSlot))
        .slice(0, 10);

      return {
        totalBookings: all.length,
        todayBookings: todayBookings.filter(b => b.status !== 'cancelled').length,
        totalRevenue,
        todayRevenue,
        occupancyRate,
        confirmedCount: confirmed.length,
        cancelledCount: all.filter(b => b.status === 'cancelled').length,
        completedCount: all.filter(b => b.status === 'completed').length,
        hourlyDistribution: hourlyDist,
        dailyDistribution: dailyDist,
        upcomingBookings: upcoming,
        recentBookings: [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 15),
      };
    },
  },
};
