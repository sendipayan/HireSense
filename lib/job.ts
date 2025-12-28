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
        take: 10,
      });
    } else {
      job = await prisma.postJob.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
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
