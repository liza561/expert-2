import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const advisorId = req.nextUrl.searchParams.get("advisorId");

    if (!advisorId) {
      return NextResponse.json(
        { error: "advisorId is required" },
        { status: 400 }
      );
    }

    // TODO: Call Convex to get earnings
    // const earnings = await convex.query("earnings:getEarningsSummary", {...})

    return NextResponse.json({
      success: true,
      earnings: {
        totalCompleted: 0,
        totalPending: 0,
        totalWithdrawn: 0,
        totalEarnings: 0,
        totalSessions: 0,
        totalHours: 0,
        availableForWithdrawal: 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch earnings" },
      { status: 500 }
    );
  }
}
