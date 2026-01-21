import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

type UserPayload = {
  userId: string;
  role: string;
  isVerified?: string;
};

async function handler(req: NextRequest, user: UserPayload) {
  if (!user.isVerified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    applicationIds,
    type,
    date,
    time,
    durations,
    location,
    phno,
    meetingLink,
    notes,
  } = await req.json();

  if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
    return NextResponse.json(
      { error: "Provide an array of application IDs" },
      { status: 400 },
    );
  }

  if (!type || !date || !time || !durations) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const recruiter = await prisma.recruiter.findUnique({
    where: { userId: user.userId },
  });

  if (!recruiter) {
    return NextResponse.json({ error: "Recruiter not found" }, { status: 404 });
  }

  const applications = await prisma.application.findMany({
    where: { id: { in: applicationIds } },
    select: { id: true, status: true },
  });

  if (applications.length === 0) {
    return NextResponse.json(
      { error: "Applications not found" },
      { status: 404 },
    );
  }

  const interview = await prisma.interview.findMany({
    where: {
      applicationId: { in: applicationIds },
    },
  });

  if (interview.length > 0) {
    return NextResponse.json(
      { error: "Interview already scheduled" },
      { status: 400 },
    );
  }

  await Promise.all(
    applicationIds.map((app) =>
      prisma.interview.create({
        data: {
          recruiterId: recruiter.id,
          applicationId: app,
          type,
          startAt: date,
          duration: durations,
          location,
          phno,
          status: "SCHEDULED",
          meetingLink,
          notes,
        },
      }),
    ),
  );

  await Promise.all(
    applicationIds.map((app) =>
      prisma.application.update({
        where: { id: app },
        data: { status: "SCHEDULED" },
      }),
    ),
  );

  return NextResponse.json(
    { message: "Interview added successfully" },
    { status: 201 },
  );
}

export const POST = withAuth(handler, { allowedRoles: ["RECRUITER"] });
