import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = req.json();

    // TODO: Call Convex to pause session
    // const result = await convex.mutation("sessions:pauseSession", {...})

    return NextResponse.json({
      success: true,
      message: "Session paused",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to pause session" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    // TODO: Call Convex to resume session
    // const result = await convex.mutation("sessions:resumeSession", {...})

    return NextResponse.json({
      success: true,
      message: "Session resumed",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to resume session" },
      { status: 500 }
    );
  }
}
