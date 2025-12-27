import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function verifyJwtEdge(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);

    return {
      userId: payload.userId as string,
      role: payload.role as "RECRUITER" | "CANDIDATE",
      isVerified: payload.isVerified as "APPROVED" | "PENDING" | "REJECTED",
    };
  } catch {
    return null;
  }
}
