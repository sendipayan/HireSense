import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

type UserPayload = {
  userId: string;
  role: string;
  isVerified?: string;
};

async function handler(req: NextRequest, user: UserPayload) {
  if (user.isVerified !== "APPROVED") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
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

  if (minSalary > maxSalary) {
    return NextResponse.json(
      { error: "Minimum salary cannot be greater than maximum salary" },
      { status: 400 },
    );
  }

  if (requirements.length <= 0) {
    return NextResponse.json(
      { error: "Requirements are required" },
      { status: 400 },
    );
  }
  const job = await prisma.postJob.create({
    data: {
      title,
      description,
      location,
      minSalary,
      maxSalary,
      jobType,
      experienceRequired,
      department,
      benifits,
      recruiterId: id,
    },
  });

  await prisma.skill.updateMany({
    where: {
      id: {
        in: requirements,
      },
    },
    data: {
      popularity: {
        increment: 1,
      },
      requiredForJobId: job.id,
    },
  });

  if (optional.length > 0) {
    await prisma.skill.updateMany({
      where: {
        id: {
          in: optional,
        },
      },
      data: {
        popularity: {
          increment: 1,
        },
        optionalForJobId: job.id,
      },
    });
  }

  return NextResponse.json(
    { message: "Job created successfully" },
    { status: 201 },
  );
}

export const POST = withAuth(handler, { allowedRoles: ["RECRUITER"] });
