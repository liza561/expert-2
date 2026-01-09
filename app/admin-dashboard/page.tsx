"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  Window,
  useChatContext,
} from "stream-chat-react";
import { Button } from "@/components/ui/button";
import { VideoIcon, LogOutIcon } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import ChatDocuments from "@/components/ChatDocuments";
import UserDashboard from "@/app/user-dashboard/page";
import streamClient from "@/lib/stream";

export default function AdminDashboardInner() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setOpen } = useSidebar();

  const { channel: activeChannel, setActiveChannel } = useChatContext();
  const chatUserId = searchParams?.get("chatUser");
  const [showDocuments, setShowDocuments] = useState(false);

  if (!isLoaded) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  const role = user?.publicMetadata?.role;
     if (role !== "user" && role !== "admin") {
    router.push("/advisor-dashboard");
    return null;
    }


  // ✅ open or create chat
  const openOrCreateChatWithUser = async (otherUserId: string) => {
    if (!user?.id) return;

    const channels = await streamClient.queryChannels({
      type: "messaging",
      members: { $in: [user.id] },
    });

    let channel = channels.find((ch) => {
      const ids = Object.keys(ch.state.members);
      return ids.length === 2 && ids.includes(user.id) && ids.includes(otherUserId);
    });

    if (!channel) {
      channel = streamClient.channel("messaging", {
        members: [user.id, otherUserId],
      });
      await channel.create();
    }

    await channel.watch();
    setActiveChannel(channel);
  };

  useEffect(() => {
    if (chatUserId) openOrCreateChatWithUser(chatUserId);
  }, [chatUserId]);

  const handleCall = () => {
    if (!activeChannel) return;
    router.push(`/admin-dashboard/video-call/${activeChannel.id}`);
    setOpen(false);
  };

  const handleLeaveChat = async () => {
    if (!activeChannel || !user?.id) return;
    if (!confirm("Leave chat?")) return;

    await activeChannel.removeMembers([user.id]);
    setActiveChannel(undefined);
    router.push("/admin-dashboard");
  };

  return (
    <div className="flex flex-col w-full h-screen">
      {activeChannel ? (
        <Channel channel={activeChannel}>
          <Window>
            <div className="flex justify-between p-2">
              <ChannelHeader />

              <div className="flex gap-2">
                <Button onClick={() => setShowDocuments(true)}>Documents</Button>
                <Button onClick={handleCall}><VideoIcon className="w-4 h-4" />Video Call</Button>
                <Button variant="destructive" onClick={handleLeaveChat}>
                  <LogOutIcon className="w-4 h-4" /> Leave Chat</Button>
              </div>
            </div>

            <MessageList />
            <MessageInput />
          </Window>

          <Thread />
        </Channel>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No Chat Selected
        </div>
      )}

      {showDocuments && (
        <ChatDocuments onClose={() => setShowDocuments(false)} />
      )}
    </div>
  );
}