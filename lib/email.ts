// lib/email.ts
import nodemailer from "nodemailer";

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  throw new Error("Missing EMAIL_USER or EMAIL_PASS environment variables");
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",   // explicit instead of service:"gmail"
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10_000,  // 10s timeout
  greetingTimeout: 10_000,
});

type SendEmailParams = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
  try {
    await transporter.sendMail({
      from: `"HireSense" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error("EMAIL ERROR:", error);
    throw new Error("Failed to send email");
  }
}