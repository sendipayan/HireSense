import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import prisma from "@/lib/prisma";

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
            select: { name: true, email: true, role: true },
          },
        },
      });
    } else {
      data = await prisma.candidate.findUnique({
        where: { userId: payload.userId },
        include: {
          user: {
            select: { name: true, email: true, role: true },
          },
        },
      });
    }

    return data;
  } catch {
    return null;
  }
}
