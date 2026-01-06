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

    // TODO: Call Convex to get payout requests
    // const payouts = await convex.query("payouts:getPayoutRequests", {...})

    return NextResponse.json({
      success: true,
      payouts: [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch payouts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { advisorId, amount, bankDetails } = await req.json();

    // TODO: Call Convex to create payout request
    // const result = await convex.mutation("payouts:createPayoutRequest", {...})

    return NextResponse.json({
      success: true,
      message: "Payout request created",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create payout request" },
      { status: 500 }
    );
  }
}
