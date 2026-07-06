import nodemailer from 'nodemailer';

export type EmailProvider = 'none' | 'resend' | 'smtp';

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

function provider(): EmailProvider {
  const raw = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  if (raw === 'resend' || raw === 'smtp') return raw;
  return 'none';
}

function appFrom(): string {
  return process.env.EMAIL_FROM?.trim() || 'Qoldau <no-reply@qoldau.local>';
}

async function sendResend(message: EmailMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) throw new Error('RESEND_API_KEY required for EMAIL_PROVIDER=resend');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: appFrom(),
      to: [message.to],
      subject: message.subject,
      text: message.text,
    }),
  });
  if (!response.ok) {
    throw new Error(`Resend email failed: ${response.status}`);
  }
}

async function sendSmtp(message: EmailMessage): Promise<void> {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT?.trim() || 587);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!host || !Number.isInteger(port) || port <= 0) {
    throw new Error('SMTP_HOST and SMTP_PORT required for EMAIL_PROVIDER=smtp');
  }
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });
  await transporter.sendMail({
    from: appFrom(),
    to: message.to,
    subject: message.subject,
    text: message.text,
  });
}

export const emailService = {
  provider,

  shouldSend(): boolean {
    return provider() !== 'none';
  },

  async send(message: EmailMessage): Promise<void> {
    const selected = provider();
    if (selected === 'none') {
      console.log('[email] EMAIL_PROVIDER=none; skipping email', { to: message.to, subject: message.subject });
      return;
    }
    if (selected === 'resend') return sendResend(message);
    return sendSmtp(message);
  },
};
