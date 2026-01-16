import prisma from "@/lib/prisma";
import { verifyJwt } from "./jwt";
import { cookies } from "next/headers";

export async function getJob() {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return null;

  try {
    const payload = verifyJwt(token);

    let job;
    if (payload.role === "RECRUITER") {
      const recuiter = await prisma.recruiter.findUnique({
        where: {
          userId: payload.userId,
        },
        select: {
          id: true,
        },
      });
      if (!recuiter) {
        return null;
      }
      job = await prisma.postJob.findMany({
        where: {
          recruiterId: recuiter.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      });
    } else {
      const applied = await prisma.application.findMany({
        where: {
          candidate: {
            userId: payload.userId,
          },
        },
        select: {
          jobId: true,
        },
      });
      job = await prisma.postJob.findMany({
        where: {
          id: {
            notIn: applied.map((data) => data.jobId),
          },
        },
        include: {
          recruiter: {
            select: {
              companyName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 4,
      });
      job = job.map((data) => {
        return {
          ...data,
          recruiter: data.recruiter.companyName,
        };
      });
    }

    job = job.map((data) => {
      return JSON.parse(
        JSON.stringify(data, (_, v) =>
          typeof v === "bigint" ? v.toString() : v
        )
      );
    });

    return job;
  } catch (error) {
    console.log(error);
    return null;
  }
}
