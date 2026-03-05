const nodemailer = require('nodemailer');

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,
} = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: Number(SMTP_PORT) === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

async function sendEmail({ to, subject, text, html }) {
  return transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });
}

module.exports = { sendEmail };