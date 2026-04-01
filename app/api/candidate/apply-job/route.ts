import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";
import { inngest } from "@/inngest/client";

type UserPayload = {
  userId: string;
  role: string;
};

async function handler(req: NextRequest, user: UserPayload) {
  const body = await req.json();
  const { jobId, candidateId, resumeId } = body;

  if (!jobId || !candidateId || !resumeId) {
    return NextResponse.json(
      { error: "Missing user Id or job Id or resume Id or all" },
      { status: 400 },
    );
  }

  const candidate = await prisma.candidate.findUnique({
    where: {
      id: candidateId,
    },
    select: {
      isVerified: true,
    },
  });

  if (!candidate?.isVerified) {
    return NextResponse.json(
      {
        error:
          "Candidate is not verified yet. Please verify your profile first",
      },
      { status: 400 },
    );
  }

  const findApplication = await prisma.application.findUnique({
    where: {
      jobId_candidateId: {
        jobId,
        candidateId,
      },
    },
  });

  if (findApplication) {
    return NextResponse.json(
      { error: "Application already exists" },
      { status: 400 },
    );
  }

  const job = await prisma.postJob.findUnique({
    where: {
      id: jobId,
    },
  });

  if (!candidate || !job) {
    return NextResponse.json(
      { error: "Job or Candidate Not Found" },
      { status: 404 },
    );
  }

  const resume = await prisma.resume.findUnique({
    where: {
      id: resumeId,
    },
  });

  if (!resume) {
    return NextResponse.json({ error: "Resume Not Found" }, { status: 404 });
  }

  const application = await prisma.application.create({
    data: {
      jobId,
      candidateId,
      resumeId,
    },
  });

  await inngest.send({
    name: "app/jdmatch",
    data:{
      resume_url:resume.resumeUrl,
      tittle:job.title,
      primary_skills:job.primary_skills,
      secondry_skill:job.secondry_skill,
      description:job.description,
      applicationId: application.id
    }
  })

  return NextResponse.json(
    { message: "Application submitted successfully", application },
    { status: 201 },
  );
}

export const POST = withAuth(handler, { allowedRoles: ["CANDIDATE"] });
