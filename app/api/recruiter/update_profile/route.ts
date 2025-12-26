import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let authUser: any;

  try {
    // 1️⃣ Verify token
    authUser = verifyJwt(token);
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    const {
      id,
      name,
      phoneNumber,
      jobTitle,
      companyName,
      companyWebsite,
      companyLinkedIn,
      industry,
      companySize,
      hiringForRoles,
      isVerified,
    } = body;

    // 2️⃣ Enforce ownership: the id must match the token user id
    if (id !== authUser.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (authUser.role !== "RECRUITER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.recruiter.findUnique({
      where: { userId: id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    // 3️⃣ Use a transaction to keep data consistent
    await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: { name },
      }),
      prisma.recruiter.update({
        where: { userId: id },
        data: {
          phoneNumber,
          jobTitle,
          companyName,
          companyWebsite,
          companyLinkedIn,
          industry,
          companySize,
          hiringForRoles,
          isVerified,
        },
      }),
    ]);

    return NextResponse.json(
      { message: "Profile updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating candidate profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
