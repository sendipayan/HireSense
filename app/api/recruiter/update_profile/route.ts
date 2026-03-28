import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { withAuth } from "@/lib/api-middleware";


type UserPayload = {
  userId: string;
  role: string;
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
    return NextResponse.json({ error: "Recruiter not found" }, { status: 404 });
  }

  if (id && email && companyWebsite && companyName && (companyName!==recruiter.companyName || companyWebsite!==recruiter.companyWebsite)) {

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
    if (data.valid_recruiter)
      isVerified="APPROVED";
    else
      isVerified="REJECTED"
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

  

  return NextResponse.json(
    { message: "Profile updated successfully" },
    { status: 200 },
  );
}

export const PATCH = withAuth(handler, { allowedRoles: ["RECRUITER"] });
