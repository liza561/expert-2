import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response("Missing userId", { status: 400 });
    }

    // Update the Clerk user's publicMetadata
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: {
        role: "admin",
      },
    });

    return new Response("User promoted to admin", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Error making admin", { status: 500 });
  }
}
