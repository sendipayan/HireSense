import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, type UserPayload } from "@/lib/api-middleware";
import { getPdfUrl } from "@/lib/s3";

async function handler(req: NextRequest, user: UserPayload) {
  const resumeId = req.nextUrl.searchParams.get("resumeId");
  const contentDisposition =
    req.nextUrl.searchParams.get("disposition") === "attachment"
      ? "attachment"
      : "inline";

  if (!resumeId) {
    return NextResponse.json({ error: "Resume ID is required" }, { status: 400 });
  }

  let resume: { resumeUrl: string; resumeMimeType: string } | null = null;

  if (user.role === "CANDIDATE") {
    const candidate = await prisma.candidate.findUnique({
      where: { userId: user.userId },
      select: { id: true },
    });

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    resume = await prisma.resume.findFirst({
      where: { id: resumeId, candidateId: candidate.id },
      select: { resumeUrl: true, resumeMimeType: true },
    });
  } else {
    const recruiter = await prisma.recruiter.findUnique({
      where: { userId: user.userId },
      select: { id: true },
    });

    if (!recruiter) {
      return NextResponse.json({ error: "Recruiter not found" }, { status: 404 });
    }

    resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        applications: {
          some: {
            job: { recruiterId: recruiter.id },
          },
        },
      },
      select: { resumeUrl: true, resumeMimeType: true },
    });
  }

  if (!resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  if (!resume.resumeUrl.startsWith("resumes/")) {
    return NextResponse.json(
      { error: "Resume is not stored in S3" },
      { status: 409 },
    );
  }

  const pdfUrl = await getPdfUrl(
    resume.resumeUrl,
    resume.resumeMimeType,
    contentDisposition,
  );
  return NextResponse.json({ pdfUrl }, { status: 200 });
}

export const GET = withAuth(handler, {
  allowedRoles: ["CANDIDATE", "RECRUITER"],
});
