import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function acceptTerms() {
  const cookieStore = await cookies();

  // Set a cookie that expires in 10 years
  cookieStore.set("terms_accepted", "true", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 10,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return NextResponse.json({ success: true });
}

export const POST = acceptTerms
