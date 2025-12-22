import nodemailer from "nodemailer";

type SendEmailParams = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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
