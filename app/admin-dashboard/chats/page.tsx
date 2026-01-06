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
import { VideoIcon, MessageSquare, BookmarkIcon, CircleIcon } from "lucide-react";
import { useChatContext } from "stream-chat-react";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { Label } from "@/components/ui/label"
import { Toggle } from "@/components/ui/toggle";
import { useMutation } from "convex/react";


export default function ChatsPage() {
  const { user } = useUser();
  const router = useRouter();
  const users = useQuery(api.users.getAllUsers);
  const { client } = useChatContext();
  const setOnlineStatus = useMutation(api.users.setOnlineStatus);
  const isAdmin = user?.publicMetadata?.role === "admin";
  if (!users) return <p className="p-6">Loading...</p>;

  const openChat = (userId: string) => {
    router.push(`/admin-dashboard?chatUser=${userId}`);
  };

  const startCall = (userId: string) => {
    router.push(`/admin-dashboard/video-call/${userId}`);
  };

  return (
    <div className="p-6 space-y-6">
    <Button
      variant="outline"
      onClick={() => router.push("/admin-dashboard")}
      className="mb-2"
    >
      ← Back to Admin Dashboard
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
                <CardHeader className="flex flex-col items-center justify-center p-0 pb-2 space-y-2">
                    {/* Profile Image */}
                    <img
                      src={u.imageURL}
                      className="w-20 h-20 rounded-full object-cover"
                    />

                    {/* Admin-controlled Online / Offline */}
                    <Toggle
                      pressed={u.isOnline}
                      disabled={!isAdmin}
                      onPressedChange={(value) =>
                        isAdmin &&
                        setOnlineStatus({
                          userId: u.userId,
                          isOnline: value,
                        })
                      }
                      aria-label="Set online status"
                      size="sm"
                      variant="outline"
                      className="
                        flex items-center gap-1 px-3 text-xs rounded-full
                        data-[state=on]:bg-green-100
                        data-[state=on]:text-green-700
                        disabled:opacity-50
                        disabled:cursor-not-allowed"
                    >
                      <CircleIcon
                        className={`h-3 w-3 ${
                          u.isOnline ? "text-green-600" : "text-gray-600"
                        }`}
                      />
                      {u.isOnline ? "Online" : "Offline"}
                    </Toggle>

                    {!isAdmin && (
                      <span className="text-[10px] text-muted-foreground">
                        Admin controlled
                      </span>
                    )}
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
