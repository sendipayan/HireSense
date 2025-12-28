import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/jwt";
import prisma from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

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
    if (payload.isVerified !== "APPROVED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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
        { status: 400 }
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
      JSON.stringify(job, (_, v) => (typeof v === "bigint" ? v.toString() : v))
    );
    return NextResponse.json(
      { message: "Job updated successfully", job },
      { status: 200 }
    );
  } catch (err) {
    console.error("job creation error: ", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
