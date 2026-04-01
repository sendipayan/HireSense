import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { withAuth } from "@/lib/api-middleware";

type UserPayload = {
  userId: string;
  role: string;
};

type JobWithRecruiter = Prisma.PostJobGetPayload<{
  include: {
    recruiter: {
      select: {
        companyName: true;
      };
    };
  };
}>;

async function handler(req: NextRequest, user: UserPayload) {
  const candidate = await prisma.candidate.findUnique({
    where: {
      userId: user.userId,
    },
    select: {
      id: true,
    },
  });

  if (!candidate) {
    return NextResponse.json({ error: "Candidate Not Found" }, { status: 404 });
  }

  const { department, experience, type, search, cursor } = await req.json();

  const limit = 4;

  let applications = await prisma.application.findMany({
    where: {
      candidateId: candidate?.id,
    },
    select: {
      jobId: true,
    },
  });

  let job: any;

  job = await prisma.postJob.findMany({
    ...(cursor && {
      cursor: {
        createdAt: cursor.createdAt,
        id: cursor.id,
      },
      skip: 1,
    }),
    where: {
      id: { notIn: applications.map((data) => data.jobId) },
      status: "ACTIVE",
      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            recruiter: {
              companyName: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        ],
      }),
      ...(department?.length > 0 && {
        department: {
          in: department,
        },
      }),
      ...(experience?.length > 0 && {
        experienceRequired: {
          in: experience,
        },
      }),
      ...(type?.length > 0 && {
        jobType: {
          in: type,
        },
      }),
    },

    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: {
      recruiter: {
        select: {
          companyName: true,
        },
      }
    },
    take: limit + 1,
  });
  job = job.map((data: JobWithRecruiter) => {
    return {
      ...data,
      recruiter: data.recruiter.companyName,
    };
  });
  const hasMore = job.length > limit;
  job = hasMore ? job.slice(0, limit) : job;

  job = job.map((data: any) => {
    return JSON.parse(
      JSON.stringify(data, (_, v) =>
        typeof v === "bigint" ? v.toString() : v,
      ),
    );
  });

  return NextResponse.json(
    {
      message: "Applications fetched successfully",
      job,
      cursor: hasMore
        ? {
            createdAt: job[job.length - 1].createdAt,
            id: job[job.length - 1].id,
          }
        : null,
      hasMore,
    },
    { status: 200 },
  );
}

export const POST = withAuth(handler, { allowedRoles: ["CANDIDATE"] });
