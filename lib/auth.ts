import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import prisma from "@/lib/prisma";

export async function getAuthUser() {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return null;

  try {
    const payload = verifyJwt(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}
