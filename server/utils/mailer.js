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

module.exports = {
  sendPasswordResetEmail,
};
