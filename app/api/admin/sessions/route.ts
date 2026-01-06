import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // TODO: Call Convex to get all sessions
    // const sessions = await convex.query("admin:getAllSessions", {})

    return NextResponse.json({
      success: true,
      sessions: [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
