import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

type UserPayload = {
  userId: string;
  role: string;
  isVerified?: string;
};

async function handler(request: NextRequest, user: UserPayload) {
  if (user.isVerified !== "APPROVED") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    id,
    title,
    description,
    jobType,
    experienceRequired,
    department,
    requirements,
    optional,
    benifits,
    minSalary,
    maxSalary,
    status,
    location,
  } = body;

  if (
    !id ||
    !title ||
    !description ||
    !location ||
    !minSalary ||
    !maxSalary ||
    !requirements ||
    !jobType ||
    !experienceRequired ||
    !department
  ) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 },
    );
  }

  if (requirements.length === 0) {
    return NextResponse.json(
      { error: "Requirements are required" },
      { status: 400 },
    );
  }

  await prisma.$transaction([
    prisma.skill.updateMany({
      where: {
        id: {
          in: requirements,
        },
      },
      data: {
        requiredForJobId: null,
        popularity: { decrement: 1 },
      },
    }),
    prisma.skill.updateMany({
      where: {
        id: {
          in: requirements,
        },
      },
      data: {
        requiredForJobId: id,
        popularity: { increment: 1 },
      },
    }),
  ]);

  if (optional.length === 0) {
    await prisma.skill.updateMany({
      where: {
        id: {
          in: optional,
        },
      },
      data: {
        optionalForJobId: null,
        popularity: { decrement: 1 },
      },
    });
  } else {
    await prisma.$transaction([
      prisma.skill.updateMany({
        where: {
          id: {
            in: optional,
          },
        },
        data: {
          optionalForJobId: null,
          popularity: { decrement: 1 },
        },
      }),
      prisma.skill.updateMany({
        where: {
          id: {
            in: optional,
          },
        },
        data: {
          optionalForJobId: id,
          popularity: { increment: 1 },
        },
      }),
    ]);
  }

  let job = await prisma.postJob.update({
    where: {
      id,
    },
    data: {
      title,
      description,
      location,
      minSalary,
      maxSalary,
      jobType,
      status,
      experienceRequired,
      department,
      benifits,
    },
  });

  job = JSON.parse(
    JSON.stringify(job, (_, v) => (typeof v === "bigint" ? v.toString() : v)),
  );
  return NextResponse.json(
    { message: "Job updated successfully", job },
    { status: 200 },
  );
}

export const PATCH = withAuth(handler, { allowedRoles: ["RECRUITER"] });
