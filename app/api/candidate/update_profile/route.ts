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

  let isVerified = false;

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

  // Prepare transaction with basic updates
  const transactionOps: any[] = [
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
  ];

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
              githubUpdatedAt: p.githubUpdatedAt,
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
              githubUpdatedAt: p.githubUpdatedAt,
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
