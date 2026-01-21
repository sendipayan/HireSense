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
      requirements,
      jobType,
      experienceRequired,
      department,
      optional,
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
