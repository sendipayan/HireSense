import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload || payload.role !== "RECRUITER" || !payload.isVerified) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Provide an array of application IDs" },
        { status: 400 }
      );
    }

    const applications = await prisma.application.findMany({
      where: { id: { in: ids } },
      select: { id: true, status: true },
    });

    if (applications.length === 0) {
      return NextResponse.json(
        { error: "Applications not found" },
        { status: 404 }
      );
    }

    // Check for disallowed statuses
    const invalid = applications.filter((app) =>
      ["ACCEPTED", "REJECTED", "SCHEDULED"].includes(app.status)
    );

    if (invalid.length > 0) {
      return NextResponse.json(
        {
          error: "Some applications cannot be moved to WAITLIST",
          blockedIds: invalid.map((a) => a.id),
        },
        { status: 400 }
      );
    }

    const result = await prisma.application.updateMany({
      where: { id: { in: ids } },
      data: { status: "PENDING" },
    });

    return NextResponse.json(
      {
        message: "Applications moved to PENDING",
        updated: result.count,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("application status update error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
