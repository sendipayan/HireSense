import { getJob } from "@/lib/job";
import { NextResponse } from "next/server";

export async function GET() {
  const job = await getJob();
  return NextResponse.json({ job });
}
