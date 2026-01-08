import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, durationSeconds, totalCharged, userWalletAfter, advisorEarning } =
      await req.json();

    // TODO: Call Convex to end session
    // const result = await convex.mutation("sessions:endSession", {...})

    return NextResponse.json({
      success: true,
      message: "Session ended successfully",
      summary: {
        durationSeconds,
        totalCharged,
        userWalletAfter,
        advisorEarning,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to end session" },
      { status: 500 }
    );
  }
}
