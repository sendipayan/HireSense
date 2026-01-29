import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { qstash } from "@/lib/qstash";
import { withAuth } from "@/lib/api-middleware";

type UserPayload = {
  userId: string;
  role: string;
};

async function handler(req: NextRequest, user: UserPayload) {
  const body = await req.json();

  const {
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
    hiringForRoles,
    isVerified,
  } = body;

  // Enforce ownership: the id in body must match the token user id
  if (id !== user.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const recruiter = await prisma.recruiter.findUnique({
    where: { userId: id },
  });

  if (!recruiter) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  if (!hiringForRoles || hiringForRoles.length === 0) {
    await prisma.role.updateMany({
      where: {
        recruiterId: recruiter.id,
      },
      data: {
        recruiterId: null,
        popularity: { decrement: 1 },
      },
    });
  } else {
    await prisma.$transaction([
      prisma.role.updateMany({
        where: {
          recruiterId: recruiter.id,
          id: {
            notIn: hiringForRoles,
          },
        },
        data: {
          recruiterId: null,
          popularity: { decrement: 1 },
        },
      }),
      prisma.role.updateMany({
        where: {
          id: {
            in: hiringForRoles,
          },
        },
        data: {
          recruiterId: recruiter.id,
          popularity: { increment: 1 },
        },
      }),
    ]);
  }

  // Use a transaction to keep data consistent
  await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: { name },
    }),
    prisma.recruiter.update({
      where: { userId: id },
      data: {
        phoneNumber,
        jobTitle,
        companyName,
        companyWebsite,
        companyLinkedIn,
        industry,
        companySize,
        isVerified,
      },
    }),
  ]);

  if (isVerified === "PENDING") {
    if (id && email && companyWebsite && companyLinkedIn && companyName) {
      const payload = {
        id,
        email,
        companyWebsite,
        companyLinkedIn,
        companyName,
      };
      if (process.env.NODE_ENV === "production") {
        await qstash.publishJSON({
          url: `${process.env.NEXTAUTH_URL}/api/recruiter/verify`,
          body: {
            payload,
          },
        });
      }
    }
  }

  return NextResponse.json(
    { message: "Profile updated successfully" },
    { status: 200 },
  );
}

export const PATCH = withAuth(handler, { allowedRoles: ["RECRUITER"] });
