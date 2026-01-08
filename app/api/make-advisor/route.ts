import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response("Missing userId", { status: 400 });
    }
     const client = await clerkClient();
    // Update the Clerk user's publicMetadata
    await client.users.updateUser(userId, {
      publicMetadata: {
        role: "advisor",
      },
    });

    return new Response("User promoted to advisor", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Error making advisor", { status: 500 });
  }
}
