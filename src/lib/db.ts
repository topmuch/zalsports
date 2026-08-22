// Simple in-memory booking store (no Prisma needed for Turbopack compatibility)

export interface Booking {
  id: string;
  date: string;
  timeSlot: string;
  customerName: string;
  customerPhone: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const bookings: Map<string, Booking> = new Map();

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

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
    findMany: async (args: { where: { date: string; status: string }; select: { timeSlot: boolean } }) => {
      const result: { timeSlot: string }[] = [];
      for (const b of bookings.values()) {
        if (b.date === args.where.date && b.status === args.where.status) {
          result.push({ timeSlot: b.timeSlot });
        }
      }
      return result;
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
  },
};
