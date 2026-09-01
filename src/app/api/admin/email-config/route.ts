import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { setEmailConfig } from '@/lib/email';
import nodemailer from 'nodemailer';

// In-memory email config store
const emailConfig: Record<string, string> = {
  smtp_host: process.env.SMTP_HOST || '',
  smtp_port: process.env.SMTP_PORT || '587',
  smtp_user: process.env.SMTP_USER || '',
  smtp_pass: process.env.SMTP_PASS || '',
  admin_email: process.env.ADMIN_EMAIL || '',
};

// Sync config to email.ts on startup
setEmailConfig(emailConfig);

// GET /api/admin/email-config
const getHandler = async () => {
  try {
    return NextResponse.json({
      smtpHost: emailConfig.smtp_host,
      smtpPort: emailConfig.smtp_port,
      smtpUser: emailConfig.smtp_user,
      smtpPass: emailConfig.smtp_pass ? '••••••••' : '',
      adminEmail: emailConfig.admin_email,
      configured: !!(emailConfig.smtp_host && emailConfig.smtp_user && emailConfig.smtp_pass),
    });
  } catch (error) {
    console.error('Get email config error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

// PUT /api/admin/email-config
const putHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { smtpHost, smtpPort, smtpUser, smtpPass, adminEmail } = body;

    if (smtpHost) emailConfig.smtp_host = smtpHost;
    if (smtpPort) emailConfig.smtp_port = smtpPort;
    if (smtpUser) emailConfig.smtp_user = smtpUser;
    if (smtpPass && smtpPass !== '••••••••') emailConfig.smtp_pass = smtpPass;
    if (adminEmail) emailConfig.admin_email = adminEmail;

    // Sync to email.ts
    setEmailConfig(emailConfig);

    return NextResponse.json({
      smtpHost: emailConfig.smtp_host,
      smtpPort: emailConfig.smtp_port,
      smtpUser: emailConfig.smtp_user,
      smtpPass: emailConfig.smtp_pass ? '••••••••' : '',
      adminEmail: emailConfig.admin_email,
      configured: !!(emailConfig.smtp_host && emailConfig.smtp_user && emailConfig.smtp_pass),
    });
  } catch (error) {
    console.error('Update email config error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

// POST /api/admin/email-config — send test email
const postHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { to } = body;
    const recipient = to || emailConfig.admin_email;

    if (!emailConfig.smtp_host || !emailConfig.smtp_user || !emailConfig.smtp_pass) {
      return NextResponse.json(
        { error: 'Configuration SMTP incomplète. Remplissez tous les champs.' },
        { status: 400 }
      );
    }

    if (!recipient) {
      return NextResponse.json(
        { error: 'Aucun email de destination configuré.' },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: emailConfig.smtp_host,
      port: Number(emailConfig.smtp_port) || 587,
      secure: Number(emailConfig.smtp_port) === 465,
      auth: {
        user: emailConfig.smtp_user,
        pass: emailConfig.smtp_pass,
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

    // Verify connection first for better error messages
    try {
      await transporter.verify();
    } catch (verifyError: unknown) {
      const vMsg = verifyError instanceof Error ? verifyError.message : 'Erreur inconnue';
      return NextResponse.json(
        { error: `Connexion SMTP impossible (${emailConfig.smtp_host}:${emailConfig.smtp_port}) : ${vMsg}` },
        { status: 500 }
      );
    }

    await transporter.sendMail({
      from: emailConfig.smtp_user,
      to: recipient,
      subject: 'Test de configuration email — ZalFoot',
      text: 'Ceci est un email de test envoyé depuis ZalFoot. La configuration SMTP fonctionne correctement.',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
          <div style="background: #16a34a; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
            <h2 style="margin: 0; font-size: 20px;">Email de test — ZalFoot</h2>
          </div>
          <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
            <p style="color: #374151; font-size: 15px;">La configuration SMTP fonctionne correctement.</p>
            <p style="color: #6b7280; font-size: 13px; margin-top: 16px;">Envoye a : <strong>${recipient}</strong></p>
            <p style="color: #6b7280; font-size: 13px;">Date : ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Dakar' })}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: `Email de test envoye a ${recipient}` });
  } catch (error: unknown) {
    console.error('Send test email error:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: `Echec de l'envoi : ${message}` },
      { status: 500 }
    );
  }
};

export const GET = withAuth(getHandler);
export const PUT = withAuth(putHandler);
export const POST = withAuth(postHandler);
