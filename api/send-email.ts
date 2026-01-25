// Updated send-email.ts to use environment keys and validate inputs
import nodemailer from 'nodemailer';

// Configure nodemailer using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: process.env.MAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

function validateInputs(to: string, subject: string, text: string) {
  if (!to || !subject || !text) {
    throw new Error('All inputs are required.');
  }
  // Additional validation logic can go here
}

export const sendEmail = (to: string, subject: string, text: string) => {
  validateInputs(to, subject, text);

  const mailOptions = {
    from: process.env.MAIL_FROM,
    to,
    subject,
    text,
  };

  return transporter.sendMail(mailOptions);
};