import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";
import { signJwt } from "@/lib/jwt";
import { cookies } from "next/headers";

type UserPayload = {
  userId: string;
  role: string;
};

async function handler(req: NextRequest, authUser: UserPayload) {
  const body = await req.json();

  const {
    id,
    name,
    phoneNumber,
    status,
    institution,
    degree,
    graduationYear,
    experienceLevel,
    githubUrl,
    portfolioUrl,
    linkedinName,
    jobTypePreference,
    openToWork,
    availability,
    projects,
  } = body;

  // Enforce ownership: the id in body must match the token user id
  if (id !== authUser.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await prisma.candidate.findUnique({
    where: { userId: id },
  });

  if (!user) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  const normalizeOptional = (value: unknown) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  };

  const normalizedName = typeof name === "string" ? name.trim() : null;
  const normalizedPhone = normalizeOptional(phoneNumber);
  const normalizedInstitution = normalizeOptional(institution);
  const normalizedDegree = normalizeOptional(degree);
  const normalizedGraduationYear = normalizeOptional(graduationYear);
  const normalizedGithubUrl = normalizeOptional(githubUrl);
  const normalizedPortfolioUrl = normalizeOptional(portfolioUrl);
  const normalizedLinkedinName = normalizeOptional(linkedinName);

  const normalizedStatus =
    status === "STUDENT" ||
    status === "GRADUATE" ||
    status === "WORKING_PROFESSIONAL" ||
    status === "NONE"
      ? status
      : null;

  const normalizedExperienceLevel =
    experienceLevel === "BEGINNER" ||
    experienceLevel === "INTERMEDIATE" ||
    experienceLevel === "ADVANCED" ||
    experienceLevel === "NONE"
      ? experienceLevel
      : null;

  const normalizedJobType =
    jobTypePreference === "FULL_TIME" ||
    jobTypePreference === "INTERNSHIP" ||
    jobTypePreference === "BOTH" ||
    jobTypePreference === "NONE"
      ? jobTypePreference
      : null;

  const normalizedAvailability =
    availability === "IMMEDIATE" ||
    availability === "ONE_TO_THREE_MONTHS" ||
    availability === "THREE_TO_SIX_MONTHS" ||
    availability === "LATER" ||
    availability === "NONE"
      ? availability
      : null;

  let isVerified = false;

  // Check all required fields are present and not empty
  // Using truthy checks to properly handle null/undefined values
  if (
    normalizedInstitution &&
    normalizedDegree &&
    normalizedGraduationYear &&
    normalizedExperienceLevel
  ) {
    isVerified = true;
  }



  console.log("isVerified", isVerified);

  const token=signJwt({
    userId:authUser.userId,
    role:authUser.role,
    isVerified
  })

  const cookieStore= await cookies()
  cookieStore.set("auth_token",token,{
    httpOnly:true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  })

  // Prepare transaction with basic updates
  

  

  

  const transactionOps: any[] = [];
  if (normalizedName) {
    transactionOps.push(
      prisma.user.update({
        where: { id },
        data: { name: normalizedName },
      }),
    );
  }
  transactionOps.push(
    prisma.candidate.update({
      where: { userId: id },
      data: {
        phoneNumber: normalizedPhone,
        status: normalizedStatus,
        institution: normalizedInstitution,
        degree: normalizedDegree,
        graduationYear: normalizedGraduationYear,
        experienceLevel: normalizedExperienceLevel,
        githubUrl: normalizedGithubUrl,
        portfolioUrl: normalizedPortfolioUrl,
        linkedinName: normalizedLinkedinName,
        jobTypePreference: normalizedJobType,
        openToWork: Boolean(openToWork),
        isVerified,
        availability: normalizedAvailability,
        
      },
    }),
  );

  // Handle Projects
  if (projects) {
    const projectIds = projects.filter((p: any) => p.id).map((p: any) => p.id);

    // Delete removed projects
    transactionOps.push(
      prisma.project.deleteMany({
        where: {
          candidateId: user.id,
          id: { notIn: projectIds },
        },
      }),
    );

    // Upsert projects
    for (const p of projects) {
      if (p.id) {
        transactionOps.push(
          prisma.project.update({
            where: { id: p.id },
            data: {
              title: p.title,
              description: p.description,
              repoUrl: p.repoUrl,
              liveLink: p.liveLink,
              language: p.language,
              stars: p.stars,
              forks: p.forks,
              githubRepoId: p.githubRepoId,
              githubUpdatedAt: p.githubUpdatedAt
                ? new Date(p.githubUpdatedAt)
                : null,
            },
          }),
        );
      } else {
        transactionOps.push(
          prisma.project.create({
            data: {
              candidateId: user.id,
              title: p.title,
              description: p.description,
              repoUrl: p.repoUrl,
              liveLink: p.liveLink,
              language: p.language,
              stars: p.stars,
              forks: p.forks,
              githubRepoId: p.githubRepoId,
              githubUpdatedAt: p.githubUpdatedAt
                ? new Date(p.githubUpdatedAt)
                : null,
            },
          }),
        );
      }
    }
  }

  await prisma.$transaction(transactionOps);

  return NextResponse.json(
    { message: "Profile updated successfully" },
    { status: 200 },
  );
}

export const PATCH = withAuth(handler, { allowedRoles: ["CANDIDATE"] });
