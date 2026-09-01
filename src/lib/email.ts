// Email sending utility - reads config from in-memory store (set via /api/admin/email-config)

let _emailConfig: Record<string, string> | null = null;

// Lazily import the email config from the API route module
// Since this is server-side only, we use a simple getter pattern
function getEmailConfig(): Record<string, string> {
  if (_emailConfig) return _emailConfig;
  // Fall back to env vars
  return {
    smtp_host: process.env.SMTP_HOST || '',
    smtp_port: process.env.SMTP_PORT || '587',
    smtp_user: process.env.SMTP_USER || '',
    smtp_pass: process.env.SMTP_PASS || '',
    admin_email: process.env.ADMIN_EMAIL || '',
  };
}

// Allow the email-config API to set the config
export function setEmailConfig(config: Record<string, string>) {
  _emailConfig = config;
}

export function isEmailConfigured(): boolean {
  const cfg = getEmailConfig();
  return !!(cfg.smtp_host && cfg.smtp_user && cfg.smtp_pass);
}

export async function sendBookingConfirmationEmail(booking: {
  date: string;
  timeSlot: string;
  customerName: string;
  customerPhone: string;
  paymentMethod?: string;
  depositPaid?: number;
}) {
  const cfg = getEmailConfig();

  if (!cfg.smtp_host || !cfg.smtp_user || !cfg.smtp_pass) {
    console.log('[email] SMTP not configured, skipping email');
    return;
  }

  const adminEmail = cfg.admin_email;
  if (!adminEmail) {
    console.log('[email] Admin email not configured, skipping email');
    return;
  }

  try {
    // Dynamic import to avoid bundling nodemailer when not needed
    const nodemailer = (await import('nodemailer')).default;

    const transporter = nodemailer.createTransport({
      host: cfg.smtp_host,
      port: Number(cfg.smtp_port) || 587,
      secure: Number(cfg.smtp_port) === 465,
      auth: {
        user: cfg.smtp_user,
        pass: cfg.smtp_pass,
      },
      tls: {
        rejectUnauthorized: false,
        // Bypass hostname verification for shared hosting with mismatched certificates
        checkServerIdentity: () => undefined,
      },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 45000,
    });

    await transporter.sendMail({
      from: cfg.smtp_user,
      to: adminEmail,
      subject: `Nouvelle réservation - ${booking.customerName} (${booking.date} ${booking.timeSlot})`,
      text: [
        `Nouvelle réservation confirmée :`,
        ``,
        `Client : ${booking.customerName}`,
        `Téléphone : ${booking.customerPhone}`,
        `Date : ${booking.date}`,
        `Créneau : ${booking.timeSlot}`,
        `Méthode de paiement : ${booking.paymentMethod || 'Non défini'}`,
        `Acompte payé : ${booking.depositPaid || 0} FCFA`,
        ``,
        `Montant total : 25 000 FCFA`,
      ].join('\n'),
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Nouvelle réservation confirmée</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Client</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.customerName}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Téléphone</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.customerPhone}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Date</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.date}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Créneau</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.timeSlot}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Paiement</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.paymentMethod || 'Non défini'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Acompte</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.depositPaid || 0} FCFA</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Total</td><td style="padding: 8px; font-weight: bold; color: #16a34a;">25 000 FCFA</td></tr>
          </table>
        </div>
      `,
    });
    console.log('[email] Booking confirmation sent to', adminEmail);
  } catch (error) {
    console.error('[email] Failed to send email:', error);
  }
}
