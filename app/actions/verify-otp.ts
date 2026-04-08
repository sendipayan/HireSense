"use server";

import prisma from "@/lib/prisma";
import { hashOtp } from "@/lib/otp";

export async function verifyOtp(email: string, otp: string) {
  const record = await prisma.emailOtp.findFirst({
    where: { email },
  });

  if (!record) {
    
    return { message: "OTP not found" };
  }

  if (record.expiresAt < new Date()) {
    
    return { message: "OTP expired" };
  }

  const otpHash = hashOtp(otp);

  if (otpHash !== record.otpHash) {
    
    return { message: "Invalid OTP" };
  }

  // OTP is single-use
  await prisma.emailOtp.deleteMany({
    where: { email },
  });

  return { verified: true };
}
