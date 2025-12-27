import prisma from "./prisma";

export async function recuiterVerify(userId: string) {
  const user = await prisma.recruiter.findUnique({
    select: {
      isVerified: true,
    },
    where: {
      userId: userId,
    },
  });

  if (user?.isVerified === "APPROVED") {
    return true;
  }
  return false;
}
