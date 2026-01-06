import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, clientId, advisorId, type, pricePerMinute } =
      await req.json();

    // TODO: Call Convex to create session
    // const session = await convex.mutation("sessions:createSession", {...})

    return NextResponse.json({
      success: true,
      sessionId,
      message: "Session started successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to start session" },
      { status: 500 }
    );
  }
}
