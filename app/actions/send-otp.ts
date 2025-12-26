"use server";

import prisma from "@/lib/prisma";
import { generateOtp, hashOtp } from "@/lib/otp";
import { sendEmail } from "@/lib/email";

export async function sendOtp(email: string) {
  // 1. Generate OTP
  const otp = generateOtp();
  console.log(otp);
  const otpHash = hashOtp(otp);

  // 2. Remove previous OTPs
  await prisma.emailOtp.deleteMany({
    where: { email },
  });

  // 3. Store hashed OTP
  await prisma.emailOtp.create({
    data: {
      email,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins
    },
  });

  // 4. Send email
  await sendEmail({
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
  });

  return { success: true };
}
