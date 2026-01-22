import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "kirokumd-admin-session";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);

  if (!session || !session.value) {
    return NextResponse.json({ authenticated: false });
  }

  // Simple validation - just check if session exists
  // In production with 2FA, this would verify the session token
  return NextResponse.json({ authenticated: true });
}
