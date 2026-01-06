import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // TODO: Call Convex to get admin dashboard data
    // const stats = await convex.query("admin:getDashboardStats", {})

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue: 0,
        totalSessions: 0,
        activeUsers: 0,
        pendingPayouts: 0,
        openDisputes: 0,
        monthlyRevenue: [],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
