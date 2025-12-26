import { NextRequest, NextResponse } from "next/server";
import { computeTrustScore } from "@/lib/verifications/truthScore";
import { dnsCheck } from "@/lib/verifications/dnsChecker";
import { websiteCheck } from "@/lib/verifications/websiteChecker";
import { linkedinCheck } from "@/lib/verifications/linkedinChecker";
import { businessRegistryCheck } from "@/lib/verifications/buisnessRegistry";
import { emailMatchesCompany } from "@/lib/verifications/emailVerifier";
import type { VerificationSignals } from "@/types/verifySignals";
import { verifyJwt } from "@/lib/jwt";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  const body = await request.json();
  const {
    email,
    companyWebsite,
    companyLinkedIn,
    recruiterLinkedIn,
    companyName,
  } = body;

  try {
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (payload.role !== "RECRUITER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!email || !companyWebsite || !companyLinkedIn || !companyName) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // 1️⃣ Hard gate — domain relationship
    const allow = await emailMatchesCompany(email, companyWebsite);
    if (!allow) {
      await prisma.recruiter.update({
        where: { userId: payload.userId },
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
        { status: 403 }
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
        where: { userId: payload.userId },
        data: { isVerified: "APPROVED" },
      });
      return NextResponse.json({
        success: true,
        reason: "Email domain matches company domain and website is real",
        score,
        signals,
      });
    }

    if (approved) {
      await prisma.recruiter.update({
        where: { userId: payload.userId },
        data: { isVerified: "APPROVED" },
      });
    } else {
      await prisma.recruiter.update({
        where: { userId: payload.userId },
        data: {
          isVerified: "REJECTED",
          failedReasons: "Verification failed",
        },
      });
    }

    // 4️⃣ Score fallback

    return NextResponse.json({
      success: approved,
      score,
      signals,
    });
  } catch (err) {
    console.error("verification error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
