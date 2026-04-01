import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { withAuth } from "@/lib/api-middleware";

type UserPayload = {
  userId: string;
  role: string;
  isVerified?: "APPROVED" | "PENDING" | "REJECTED" | true | false;
};

async function handler(req: NextRequest, user: UserPayload) {
 

  if (user.role === "RECRUITER") {
    const job = await prisma.postJob.findMany({
      where: {
        recruiter: {
          userId: user.userId,
        },
      },
      select: {
        id: true,
        title: true,
      },
    });
    return NextResponse.json({ job });
  } else {
    const job = await prisma.postJob.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        id: true,
        title: true,
      },
    });
    return NextResponse.json({ job });
  }
}

export const GET = withAuth(handler, {
  allowedRoles: ["RECRUITER", "CANDIDATE"],
});
