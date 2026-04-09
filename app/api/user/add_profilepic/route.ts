import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";
import { redis } from "@/lib/redis";
import { AUTH_USER_CACHE_TTL_SECONDS } from "@/lib/auth";

async function handler(
  req: NextRequest,
  user: { userId: string; role: string },
) {
  const body = await req.json();
  const { fileUrl } = body;

  if (!fileUrl)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const updatedUser = await prisma.user.update({
    where: { id: user.userId },
    data: { profilePic: fileUrl },
  });

  try {
    const cacheKey = `user:${user.userId}`;
    await redis.del(cacheKey);

    const refreshedUser =
      user.role === "RECRUITER"
        ? await prisma.recruiter.findUnique({
            where: { userId: user.userId },
            include: {
              user: {
                select: { name: true, email: true, role: true, profilePic: true },
              },
            },
          })
        : await prisma.candidate.findUnique({
            where: { userId: user.userId },
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
    {
      message: "Profile picture added successfully",
      user: updatedUser,
    },
    { status: 200 },
  );
}

export const POST = withAuth(handler);
