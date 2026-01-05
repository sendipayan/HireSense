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
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { error: "Invalid job ID or candidate ID" },
        { status: 400 }
      );
    }

    console.log("application id: ", id);

    const application = await prisma.application.findUnique({
      where: {
        id,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (
      application.status === "ACCEPTED" ||
      application.status === "REJECTED" ||
      application.status === "SCHEDULED"
    ) {
      return NextResponse.json(
        { error: "Status cannot be changed" },
        { status: 400 }
      );
    }

    const updatedApplication = await prisma.application.update({
      where: {
        id,
      },
      data: {
        status: application.status === "WAITLIST" ? "PENDING" : "WAITLIST",
      },
    });

    return NextResponse.json(
      {
        message: "Application status updated successfully",
        status: updatedApplication.status,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("application status update error: ", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
