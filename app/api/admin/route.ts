import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const client = await clerkClient();

    const { data: users } = await client.users.getUserList({
      limit: 100,
    });

    // Filter admins by role
    const admins = users
      .filter((user) => user.publicMetadata?.role === "admin")
      .map((user) => ({
        id: user.id, 
        name: user.fullName ?? "Admin",
        username: user.username ?? user.primaryEmailAddress?.emailAddress ?? "",
      }));

    return NextResponse.json(admins);
  } catch (error) {
    console.error("Failed to fetch admins", error);
    return NextResponse.json([], { status: 500 });
  }
}