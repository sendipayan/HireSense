import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { withAuth } from "@/lib/api-middleware";
import { signJwt } from "@/lib/jwt";
import { cookies } from "next/headers";
import { redis } from "@/lib/redis";
import { AUTH_USER_CACHE_TTL_SECONDS } from "@/lib/auth";


type UserPayload = {
  userId: string;
  role: string;
  isVerified?: "APPROVED" | "PENDING" | "REJECTED" | true | false;
};


async function handler(req: NextRequest, user: UserPayload) {
  const body = await req.json();

  let {
    id,
    name,
    email,
    phoneNumber,
    jobTitle,
    companyName,
    companyWebsite,
    companyLinkedIn,
    industry,
    companySize,
  } = body;

  // Enforce ownership: the id in body must match the token user id
  if (id !== user.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const recruiter = await prisma.recruiter.findUnique({
    where: { userId: id },
  });

  if (!recruiter) {
    return NextResponse.json({ error: "Recruiter not found" }, { status: 404 });
  }

  const normalizeOptional = (value: unknown) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  };

  const normalizedName = typeof name === "string" ? name.trim() : null;
  const normalizedEmail = typeof email === "string" ? email.trim() : null;
  const normalizedPhone = normalizeOptional(phoneNumber);
  const normalizedJobTitle = normalizeOptional(jobTitle);
  const normalizedCompanyName = normalizeOptional(companyName);
  const normalizedCompanyWebsite = normalizeOptional(companyWebsite);
  const normalizedCompanyLinkedIn = normalizeOptional(companyLinkedIn);
  const normalizedIndustry = normalizeOptional(industry);
  const companySizeValue = typeof companySize === "string" ? companySize.trim() : "";
  const normalizedCompanySize =
    companySizeValue === "SMALL" ||
    companySizeValue === "MEDIUM" ||
    companySizeValue === "LARGE" ||
    companySizeValue === "ENTERPRISE"
      ? companySizeValue
      : null;

  let nextVerificationStatus = recruiter.isVerified;

  if (
    id &&
    normalizedEmail &&
    normalizedCompanyWebsite &&
    normalizedCompanyName &&
    (normalizedCompanyName !== recruiter.companyName ||
      normalizedCompanyWebsite !== recruiter.companyWebsite)
  ) {

    const res = await fetch(
      "https://wxerjdklv745wy4c2r2jirfkvu0jgofs.lambda-url.us-east-1.on.aws/validate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          company_name: companyName, 
          company_website: companyWebsite,
        }),
      },
    );
    if (!res.ok)
      return NextResponse.json({error:"Verification server not working"},{status: 503})
    const data = await res.json();
    if (data.valid_recruiter) nextVerificationStatus = "APPROVED";
    else nextVerificationStatus = "REJECTED";
  }

  const token =signJwt({
    userId:user.userId,
    role:user.role,
    isVerified:nextVerificationStatus
  })
  const cookieStore= await cookies();

  cookieStore.set("auth_token",token,{
    httpOnly:true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  })
  

  // Use a transaction to keep data consistent
  const transactionCalls = [];
  if (normalizedName) {
    transactionCalls.push(
      prisma.user.update({
        where: { id },
        data: { name: normalizedName },
      }),
    );
  }
  transactionCalls.push(
    prisma.recruiter.update({
      where: { userId: id },
      data: {
        phoneNumber: normalizedPhone,
        jobTitle: normalizedJobTitle,
        companyName: normalizedCompanyName,
        companyWebsite: normalizedCompanyWebsite,
        companyLinkedIn: normalizedCompanyLinkedIn,
        industry: normalizedIndustry,
        companySize: normalizedCompanySize,
        isVerified: nextVerificationStatus,
      },
    }),
  );

  await prisma.$transaction(transactionCalls);

  try {
    const cacheKey = `user:${user.userId}`;
    await redis.del(cacheKey)

    const cachedUser = await prisma.recruiter.findUnique({
      where: { userId: user.userId },
      include: {
        user: {
          select: { name: true, email: true, role: true, profilePic: true },
        },
      },
    });

    if (cachedUser) {
      await redis.set(
        cacheKey,
        JSON.stringify(cachedUser),
        "EX",
        AUTH_USER_CACHE_TTL_SECONDS,
      );
    }
  } catch (err) {
    console.error("Redis cache update error", err);
  }

  

  return NextResponse.json(
    { message: "Profile updated successfully" },
    { status: 200 },
  );
}

export const PATCH = withAuth(handler, { allowedRoles: ["RECRUITER"] });
