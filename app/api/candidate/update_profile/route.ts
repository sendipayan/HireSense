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

  console.log("institution", institution);
  console.log("degree", degree);
  console.log("graduationYear", graduationYear);
  console.log("primarySkills", primarySkills);
  console.log("experienceLevel", experienceLevel);
  console.log("preferredRoles", preferredRoles);

  // Check all required fields are present and not empty
  // Using truthy checks to properly handle null/undefined values
  if (
    institution &&
    institution.trim() !== "" &&
    degree &&
    degree.trim() !== "" &&
    graduationYear &&
    graduationYear.trim() !== "" &&
    primarySkills &&
    primarySkills.length > 0 &&
    experienceLevel &&
    experienceLevel.trim() !== "" &&
    preferredRoles &&
    preferredRoles.length > 0
  ) {
    isVerified = true;
  }

  if (!primarySkills || primarySkills.length === 0) {
    await prisma.skill.updateMany({
      where: {
        primaryForCandidateId: user.id,
      },
      data: {
        primaryForCandidateId: null,
        popularity: { decrement: 1 },
      },
    });
  } else {
    await prisma.$transaction([
      prisma.skill.updateMany({
        where: {
          primaryForCandidateId: user.id,
          id: {
            notIn: primarySkills,
          },
        },
        data: {
          primaryForCandidateId: null,
          popularity: { decrement: 1 },
        },
      }),
      prisma.skill.updateMany({
        where: {
          id: {
            in: primarySkills,
          },
        },
        data: {
          primaryForCandidateId: user.id,
          popularity: { increment: 1 },
        },
      }),
    ]);
  }

  if (!secondarySkills || secondarySkills.length === 0) {
    await prisma.skill.updateMany({
      where: {
        secondaryForCandidateId: user.id,
      },
      data: {
        secondaryForCandidateId: null,
        popularity: { decrement: 1 },
      },
    });
  } else {
    await prisma.$transaction([
      prisma.skill.updateMany({
        where: {
          secondaryForCandidateId: user.id,
          id: {
            notIn: secondarySkills,
          },
        },
        data: {
          secondaryForCandidateId: null,
          popularity: { decrement: 1 },
        },
      }),
      prisma.skill.updateMany({
        where: {
          id: {
            in: secondarySkills,
          },
        },
        data: {
          secondaryForCandidateId: user.id,
          popularity: { increment: 1 },
        },
      }),
    ]);
  }

  if (!preferredRoles || preferredRoles.length === 0) {
    // Remove all preferred roles for this candidate
    await prisma.role.updateMany({
      where: {
        preferredByCandidateId: user.id,
      },
      data: {
        preferredByCandidateId: null,
        popularity: { decrement: 1 },
      },
    });
  } else {
    await prisma.$transaction([
      prisma.role.updateMany({
        where: {
          preferredByCandidateId: user.id,
        },
        data: {
          preferredByCandidateId: null,
          popularity: { decrement: 1 },
        },
      }),
      prisma.role.updateMany({
        where: {
          id: {
            in: preferredRoles,
          },
        },
        data: {
          preferredByCandidateId: user.id,
          popularity: { increment: 1 },
        },
      }),
    ]);
  }

  console.log("isVerified", isVerified);

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
        experienceLevel,
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
