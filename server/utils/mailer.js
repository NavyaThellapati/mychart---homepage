const nodemailer = require('nodemailer');

function hasSmtpConfig() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
}

function createTransporter() {
  if (!hasSmtpConfig()) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const transporter = createTransporter();

  if (!transporter) {
    if (process.env.NODE_ENV === 'development') {
      console.info('[password-reset] SMTP is not configured; email was not sent.');
    }
    return {
      sent: false,
      message: 'SMTP is not configured.',
    };
  }

  await transporter.sendMail({
    from,
    to,
    subject: 'Reset your MyChart password',
    text: [
      `Hi ${name || 'there'},`,
      '',
      'We received a request to reset your MyChart password.',
      `Use this link to reset your password: ${resetUrl}`,
      '',
      'This link expires in 1 hour. If you did not request this, you can ignore this email.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
        <h2>Reset your MyChart password</h2>
        <p>Hi ${name || 'there'},</p>
        <p>We received a request to reset your MyChart password.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break:break-all;color:#2563eb;">${resetUrl}</p>
        <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });

  return {
    sent: true,
    message: 'Password reset email sent.',
  };
}

async function sendLoginOtpEmail({ to, name, otp }) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const transporter = createTransporter();

  if (!transporter) {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[mfa] SMTP is not configured; login code for ${to}: ${otp}`);
    }
    return {
      sent: false,
      message: 'SMTP is not configured.',
    };
  }

  await transporter.sendMail({
    from,
    to,
    subject: 'Your MyChart verification code',
    text: [
      `Hi ${name || 'there'},`,
      '',
      `Your MyChart verification code is ${otp}.`,
      '',
      'This code expires in 10 minutes. If you did not try to sign in, change your password immediately.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
        <h2>Your MyChart verification code</h2>
        <p>Hi ${name || 'there'},</p>
        <p>Use this one-time code to finish signing in:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">${otp}</p>
        <p>This code expires in 10 minutes. If you did not try to sign in, change your password immediately.</p>
      </div>
    `,
  });

  return {
    sent: true,
    message: 'Verification code sent.',
  };
}

module.exports = {
  sendLoginOtpEmail,
  sendPasswordResetEmail,
};
