import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

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
    primarySkills,
    secondarySkills,
    experienceLevel,
    preferredRoles,
    githubUrl,
    portfolioUrl,
    linkedinUrl,
    jobTypePreference,
    openToWork,
    availability,
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

  let isVerified = false;

  if (
    institution.trim() !== "" &&
    degree.trim() !== "" &&
    graduationYear.trim() !== "" &&
    primarySkills.length > 0 &&
    experienceLevel.trim() !== "" &&
    preferredRoles.length > 0
  ) {
    isVerified = true;
  }

  // Use a transaction to keep data consistent
  await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: { name },
    }),
    prisma.candidate.update({
      where: { userId: id },
      data: {
        phoneNumber,
        status,
        institution,
        degree,
        graduationYear,
        primarySkills,
        secondarySkills,
        experienceLevel,
        preferredRoles,
        githubUrl,
        portfolioUrl,
        linkedinUrl,
        jobTypePreference,
        openToWork,
        isVerified,
        availability,
      },
    }),
  ]);

  return NextResponse.json(
    { message: "Profile updated successfully" },
    { status: 200 },
  );
}

export const PATCH = withAuth(handler, { allowedRoles: ["CANDIDATE"] });
