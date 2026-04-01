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

  const minSalaryValue = Number(minSalary);
  const maxSalaryValue = Number(maxSalary);
  if (Number.isNaN(minSalaryValue) || Number.isNaN(maxSalaryValue)) {
    return NextResponse.json(
      { error: "Salary must be a number" },
      { status: 400 },
    );
  }

  if (minSalaryValue > maxSalaryValue) {
    return NextResponse.json(
      { error: "Minimum salary cannot be greater than maximum salary" },
      { status: 400 },
    );
  }

  

  

  

  const job = await prisma.postJob.create({
    data: {
      title,
      description,
      location,
      minSalary: minSalaryValue,
      maxSalary: maxSalaryValue,
      jobType,
      experienceRequired,
      department,
      primary_skills:requirements,
      secondry_skill:optional,
      benifits,
      recruiterId: id,
    },
  });

  

  return NextResponse.json(
    { message: "Job created successfully" },
    { status: 201 },
  );
}

export const POST = withAuth(handler, { allowedRoles: ["RECRUITER"] });
