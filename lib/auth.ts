import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import prisma from "@/lib/prisma";
//import { getJob } from "./job";

export async function getAuthUser() {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return null;

  try {
    const payload = verifyJwt(token);

    let data;
    if (payload.role === "RECRUITER") {
      data = await prisma.recruiter.findUnique({
        where: { userId: payload.userId },
        include: {
          user: {
            select: { name: true, email: true, role: true, profilePic: true },
          },
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
        },
      });
      const primarySkills = await prisma.skill.findMany({
        where: {
          primaryForCandidateId: data?.id,
        },
        select: {
          id: true,
          name: true,
        },
      });
      const secondarySkills = await prisma.skill.findMany({
        where: {
          secondaryForCandidateId: data?.id,
        },
        select: {
          id: true,
          name: true,
        },
      });
      const preferredRoles = await prisma.role.findMany({
        where: {
          preferredByCandidateId: data?.id,
        },
        select: {
          id: true,
          name: true,
        },
      });
      data = {
        ...data,
        primarySkills,
        secondarySkills,
        preferredRoles,
      };
    }
    //const job = await getJob();
    //if (!job) {
    //return data;
    //}
    return data;
  } catch {
    return null;
  }
}
