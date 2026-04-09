import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import { redis } from "./redis";
//import { getJob } from "./job";

export const AUTH_USER_CACHE_TTL_SECONDS = 3600;

export async function getAuthUser() {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return null;

  try {
    const payload = verifyJwt(token);

    let data;
    try {
      const cached = await redis.get(`user:${payload.userId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Redis cache read failed:", err);
    }
    if (payload.role === "RECRUITER") {
      data = await prisma.recruiter.findUnique({
        where: { userId: payload.userId },
        include: {
          user: {
            select: { name: true, email: true, role: true, profilePic: true },
          }
        },
      });
    } else {
      data = await prisma.candidate.findUnique({
        where: { userId: payload.userId },
        include: {
          resumes: {
            where: {
              isActive: true,
            },
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
      
    
    }
    //const job = await getJob();
    //if (!job) {
    //return data;
    //}
    if (data) {
      try {
        await redis.set(
          `user:${payload.userId}`,
          JSON.stringify(data),
          "EX",
          AUTH_USER_CACHE_TTL_SECONDS,
        );
      } catch (err) {
        console.warn("Redis cache write failed:", err);
      }
    }
    return data;
  } catch {
    return null;
  }
}
