import prisma from "@/lib/prisma";
import { verifyJwt } from "./jwt";
import { cookies } from "next/headers";

export async function getJob() {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return null;

  try {
    const payload = verifyJwt(token);

    let job;
    let hasMore;
    if (payload.role === "RECRUITER") {
      const limit = 6;
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
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: limit + 1,
      });

      hasMore = job.length > limit;
      job = hasMore ? job.slice(0, limit) : job;
    } else {
      const limit1 = 4;
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
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: limit1 + 1,
      });
      job = job.map((data) => {
        return {
          ...data,
          recruiter: data.recruiter.companyName,
        };
      });
      hasMore = job.length > limit1;
      job = hasMore ? job.slice(0, limit1) : job;
    }

    job = job.map((data) => {
      return JSON.parse(
        JSON.stringify(data, (_, v) =>
          typeof v === "bigint" ? v.toString() : v,
        ),
      );
    });

    return {
      job,
      cursor: hasMore
        ? {
            createdAt: job[job.length - 1].createdAt,
            id: job[job.length - 1].id,
          }
        : null,
      hasMore,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}
