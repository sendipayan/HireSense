import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";
import { inngest } from "@/inngest/client";


type UserPayload = {
  userId: string;
  role: string;
  isVerified?: "APPROVED" | "PENDING" | "REJECTED" | true | false;
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

  const minSalaryValue = Number(minSalary);
  const maxSalaryValue = Number(maxSalary);
  if (Number.isNaN(minSalaryValue) || Number.isNaN(maxSalaryValue)) {
    return NextResponse.json(
      { error: "Salary must be a number" },
      { status: 400 },
    );
  }

  if (!Array.isArray(requirements) || !Array.isArray(optional)) {
    return NextResponse.json(
      { error: "Skills should be array" },
      { status: 400 },
    );
  }

  const oldjob = await prisma.postJob.findUnique({
    where: {
      id,
    },
  });

  if (!oldjob) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const normalize = (arr: string[]) => arr.map((s) => s.trim().toLowerCase());

  const skillsChanged =
    oldjob.primary_skills.length !== requirements.length ||
    normalize(oldjob.primary_skills).some(
      (s) => !normalize(requirements).includes(s),
    );

  const s_skillsChanged =
    oldjob.secondry_skill.length !== optional.length ||
    normalize(oldjob.secondry_skill).some(
      (s) => !normalize(optional).includes(s),
    );

  if (skillsChanged || s_skillsChanged || oldjob.description !== description) {
    await inngest.send({
      name: "app/update/scores",
      data: {
        jobId: oldjob.id,
        jobTitle: title,
        primSkills: requirements,
        seconSkills: optional,
        jobResp: description,
      },
    });
  }

  const normalizedStatus =
    status === "ACTIVE" || status === "CLOSED" ? status : undefined;

  let job = await prisma.postJob.update({
    where: {
      id,
    },
    data: {
      title,
      description,
      location,
      minSalary: minSalaryValue,
      maxSalary: maxSalaryValue,
      jobType,
      primary_skills: requirements,
      secondry_skill: optional,
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
