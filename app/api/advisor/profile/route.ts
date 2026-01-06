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

    // TODO: Call Convex to get advisor profile
    // const profile = await convex.query("advisorProfiles:getAdvisorProfile", {...})

    return NextResponse.json({
      success: true,
      profile: {
        bio: "",
        specialization: [],
        chatPricePerMinute: 0,
        videoPricePerMinute: 0,
        averageRating: 0,
        totalRatings: 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch advisor profile" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      bio,
      specialization,
      chatPricePerMinute,
      videoPricePerMinute,
      availabilityHours,
    } = await req.json();

    // TODO: Call Convex to create/update advisor profile
    // const result = await convex.mutation("advisorProfiles:upsertAdvisorProfile", {...})

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
