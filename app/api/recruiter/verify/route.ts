import { NextRequest, NextResponse } from "next/server";
import { computeTrustScore } from "@/lib/verifications/truthScore";
import { dnsCheck } from "@/lib/verifications/dnsChecker";
import { websiteCheck } from "@/lib/verifications/websiteChecker";
import { linkedinCheck } from "@/lib/verifications/linkedinChecker";
import { businessRegistryCheck } from "@/lib/verifications/buisnessRegistry";
import { emailMatchesCompany } from "@/lib/verifications/emailVerifier";
import type { VerificationSignals } from "@/types/verifySignals";
import { signJwt } from "@/lib/jwt";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

type verificationStatus = "APPROVED" | "PENDING" | "REJECTED";

type UserPayload = {
  userId: string;
  role: string;
};

async function handler(request: NextRequest, user: UserPayload) {
  const recruiter = await prisma.recruiter.findUnique({
    where: { userId: user.userId },
    select: {
      isVerified: true,
    },
  });

  if (recruiter?.isVerified === "APPROVED") {
    return NextResponse.json(
      { error: "User already verified" },
      { status: 400 },
    );
  }

  const body = await request.json();
  const {
    email,
    companyWebsite,
    companyLinkedIn,
    recruiterLinkedIn,
    companyName,
  } = body;

  if (!email || !companyWebsite || !companyLinkedIn || !companyName) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 },
    );
  }

  // 1️⃣ Hard gate — domain relationship
  const allow = await emailMatchesCompany(email, companyWebsite);
  if (!allow) {
    await prisma.recruiter.update({
      where: { userId: user.userId },
      data: {
        isVerified: "REJECTED",
        failedReasons: "Email domain does not match company domain",
      },
    });
    return NextResponse.json(
      {
        success: false,
        score: 0,
        reason: "Email domain does not match company domain",
      },
      { status: 403 },
    );
  }

  // 2️⃣ Collect signals
  const signals: VerificationSignals = {
    dns: await dnsCheck(email),
    website: await websiteCheck(companyWebsite),

    linkedinRecruiter: recruiterLinkedIn
      ? await linkedinCheck(recruiterLinkedIn)
      : { valid: false, accessible: false },

    linkedinCompany: await linkedinCheck(companyLinkedIn),

    registry: await businessRegistryCheck(companyName),

    emailVerified: allow,
  };

  const score = computeTrustScore(signals);
  const approved = score >= 60;
  // 3️⃣ Fast-path auto-approve
  if (signals.emailVerified && signals.website.real) {
    await prisma.recruiter.update({
      where: { userId: user.userId },
      data: { isVerified: "APPROVED" },
    });
    const token1 = signJwt({
      userId: user.userId,
      role: user.role,
      isVerified: "APPROVED",
    });
    const cookieStore = await cookies();

    cookieStore.set("auth_token", token1, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return NextResponse.json({
      success: true,
      reason: "Email domain matches company domain and website is real",
      score,
      signals,
    });
  }

  let isVerified: verificationStatus = "REJECTED";

  if (approved) {
    await prisma.recruiter.update({
      where: { userId: user.userId },
      data: { isVerified: "APPROVED" },
    });

    isVerified = "APPROVED";
  } else {
    await prisma.recruiter.update({
      where: { userId: user.userId },
      data: {
        isVerified: "REJECTED",
        failedReasons: "Verification failed",
      },
    });
  }

  const token1 = signJwt({
    userId: user.userId,
    role: user.role,
    isVerified,
  });
  const cookieStore = await cookies();

  cookieStore.set("auth_token", token1, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  // 4️⃣ Score fallback

  return NextResponse.json({
    success: approved,
    score,
    signals,
  });
}

export const POST = withAuth(handler, { allowedRoles: ["RECRUITER"] });
