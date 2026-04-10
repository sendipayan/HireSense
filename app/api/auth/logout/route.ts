"use server";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyJwt } from "@/lib/jwt";
import { redis } from "@/lib/redis";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token");

  if (!token)
    return NextResponse.json({ error: "token not present" }, { status: 400 });

  const payload = verifyJwt(token.value);
  try {
    const keys = await redis.keys(`user:${payload.userId}:*`);

    await redis.del(`user:${payload.userId}`, ...keys);
  } catch (err) {
    console.warn("redis cache error: ", err);
  }

  cookieStore.delete("auth_token");

  return NextResponse.json({ success: true });
}
