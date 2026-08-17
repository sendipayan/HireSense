import { NextRequest, NextResponse } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";
import { redis } from "@/lib/redis";
import { AUTH_USER_CACHE_TTL_SECONDS } from "@/lib/auth";
import { s3 } from "@/lib/s3";

const bucketName = process.env.AWS_S3_BUCKET!;

type UserPayload = {
  userId: string;
  role: string;
};

async function handler(
  req: NextRequest,
  authUser: UserPayload,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
  }

  const user = await prisma.candidate.findUnique({
    where: {
      userId: authUser.userId,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const resume = await prisma.resume.findFirst({
    where: {
      id,
      candidateId: user.id,
    },
    select: {
      resumeUrl: true,
    },
  });

  if (!resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }
  const inUse = await prisma.application.findFirst({
    where: {
      resumeId: id,
    },
  });

  if (inUse) {
    return NextResponse.json({ error: "Resume is in use" }, { status: 400 });
  }

  if (resume.resumeUrl.startsWith(`resumes/${user.id}/`)) {
    await s3.send(
      new DeleteObjectCommand({ Bucket: bucketName, Key: resume.resumeUrl }),
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.resume_recommendations.deleteMany({
      where: {
        resume_id: id,
      },
    });

    await tx.resume_ats.deleteMany({
      where: {
        resume_id: id,
      },
    });

    await tx.resume.delete({
      where: {
        id,
      },
    });
  });

  try {
    const cacheKey = `user:${authUser.userId}`;
    await redis.del(cacheKey);

    const refreshedUser = await prisma.candidate.findUnique({
      where: { userId: authUser.userId },
      include: {
        resumes: {
          where: { isActive: true },
          select: {
            id: true,
            resumeName: true,
            resumeUrl: true,
            createdAt: true,
          },
        },
        user: {
          select: { name: true, email: true, role: true, profilePic: true },
        },
        projects: true,
      },
    });

    if (refreshedUser) {
      await redis.set(
        cacheKey,
        JSON.stringify(refreshedUser),
        "EX",
        AUTH_USER_CACHE_TTL_SECONDS,
      );
    }
  } catch (err) {
    console.error("Redis cache update error", err);
  }

  return NextResponse.json(
    { message: "Resume deleted successfully" },
    { status: 200 },
  );
}

export const DELETE = withAuth(handler, { allowedRoles: ["CANDIDATE"] });
