import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

type UserPayload = {
  userId: string;
  role: string;
  isVerified?: string;
};

async function handler(req: NextRequest, user: UserPayload) {
  if (user.isVerified !== "APPROVED") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ids } = await req.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json(
      { error: "Provide an array of application IDs" },
      { status: 400 },
    );
  }

  const applications = await prisma.application.findMany({
    where: { id: { in: ids } },
    select: { id: true, status: true },
  });

  if (applications.length === 0) {
    return NextResponse.json(
      { error: "Applications not found" },
      { status: 404 },
    );
  }

  // Check for disallowed statuses
  const invalid = applications.filter((app) =>
    ["ACCEPTED", "REJECTED", "SCHEDULED", "PENDING"].includes(app.status),
  );

  if (invalid.length > 0) {
    return NextResponse.json(
      {
        error: "Some applications cannot be moved to WAITLIST",
        blockedIds: invalid.map((a) => a.id),
      },
      { status: 400 },
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
    { status: 200 },
  );
}

export const POST = withAuth(handler, { allowedRoles: ["RECRUITER"] });
