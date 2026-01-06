import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // TODO: Call Convex to get all disputes
    // const disputes = await convex.query("disputes:getDisputes", {})

    return NextResponse.json({
      success: true,
      disputes: [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch disputes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { disputeId, status, resolution, refundAmount } = await req.json();

    // TODO: Call Convex to update dispute
    // const result = await convex.mutation("disputes:updateDisputeStatus", {...})

    return NextResponse.json({
      success: true,
      message: "Dispute updated",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update dispute" },
      { status: 500 }
    );
  }
}
