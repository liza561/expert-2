"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VideoIcon, MessageSquare } from "lucide-react";
import { useChatContext } from "stream-chat-react";

export default function ChatsPage() {
  const { user } = useUser();
  const router = useRouter();
  const users = useQuery(api.users.getAllUsers);

  const { client } = useChatContext();

  if (!users) return <p className="p-6">Loading...</p>;

  const openChat = (userId: string) => {
    router.push(`/user-dashboard?chatUser=${userId}`);
  };

  const startCall = (userId: string) => {
    router.push(`/user-dashboard/video-call/${userId}`);
  };

  return (
    <div className="p-6 space-y-6">
    <Button
      variant="outline"
      onClick={() => router.push("/user-dashboard")}
      className="mb-2"
    >
      ← Back to User Dashboard
    </Button>
      <h1 className="text-2xl font-semibold">All Users</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {users
          .filter((u) => u.userId !== user?.id)
          .map((u) => {
            const isOnline = u.isOnline; // Coming from Convex DB


            return (
              <Card
                key={u._id}
                className="rounded-xl border p-3 hover:shadow-md transition"
              >
                <CardHeader className="flex flex-col items-center justify-center p-0 pb-2">
                  <div className="relative">
                    <img
                      src={u.imageURL}
                      className="w-20 h-20 rounded-full object-cover"
                    />

                    {/* Online Status Dot */}
                    <span
                      className={`absolute bottom-1 right-1 block w-4 h-4 rounded-full border-2 border-white ${
                        isOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                    ></span>
                  </div>
                </CardHeader>

                <CardContent className="text-center p-0 space-y-2">
                  <CardTitle className="text-sm font-medium">
                    {u.name}
                  </CardTitle>

                  <p className="text-xs text-muted-foreground">{u.email}</p>

                  {/* Only show buttons if user is online */}
                  {isOnline && (
                    <div className="flex justify-center gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openChat(u.userId)}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Chat
                      </Button>

                      <Button size="sm" onClick={() => startCall(u.userId)}>
                        <VideoIcon className="w-4 h-4 mr-1" />
                        Video Call
                      </Button>
                    </div>
                  )}
                </CardContent>

              </Card>
            );
          })}
      </div>
    </div>
  );
}
