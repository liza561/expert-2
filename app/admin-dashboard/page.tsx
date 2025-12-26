"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { Button } from "@/components/ui/button";
import { VideoIcon, LogOutIcon } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import ChatDocuments from "@/components/ChatDocuments";
import UserDashboard from "@/app/user-dashboard/page";
import streamClient from "@/lib/stream";
import { useChatContext } from "stream-chat-react";

function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setOpen } = useSidebar();

  const chatUserId = searchParams?.get("chatUser");
  const { channel: activeChannel, setActiveChannel } = useChatContext();
  const [showDocuments, setShowDocuments] = useState(false);

  if (!isLoaded) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  const role = user?.publicMetadata?.role;

  if (role !== "admin") {
    return <UserDashboard />;
  }

  // Open or create a 1:1 chat with a user
  const openOrCreateChatWithUser = async (otherUserId: string) => {
    if (!streamClient || !user?.id) return;

    try {
      // Query existing channels where admin is a member
      const channels = await streamClient.queryChannels({
        type: "messaging",
        members: { $in: [user.id] },
      });

      let existingChannel = channels.find((ch) => {
        const memberIds = Object.keys(ch.state.members);
        return (
          memberIds.length === 2 &&
          memberIds.includes(user.id) &&
          memberIds.includes(otherUserId)
        );
      });

      if (!existingChannel) {
        existingChannel = streamClient.channel("messaging", {
          members: [user.id, otherUserId],
        });
        await existingChannel.create();
      } else {
        // Ensure the user is included
        const memberIds = Object.keys(existingChannel.state.members);
        if (!memberIds.includes(otherUserId)) {
          await existingChannel.addMembers([otherUserId]);
        }
      }

      await existingChannel.watch();
      setActiveChannel(existingChannel);
    } catch (err) {
      console.error("Error opening/creating chat:", err);
    }
  };

  // Automatically open chat if chatUserId exists
  useEffect(() => {
    if (!chatUserId) return;
    openOrCreateChatWithUser(chatUserId);
  }, [chatUserId]);

  const handleCall = () => {
    if (!activeChannel) return;
    router.push(`/admin-dashboard/video-call/${activeChannel.id}`);
    setOpen(false);
  };

  const handleLeaveChat = async () => {
    if (!activeChannel || !user?.id) return;
    if (!window.confirm("Are you sure you want to leave the chat?")) return;

    try {
      await activeChannel.removeMembers([user.id]);
      setActiveChannel(null);
      router.push("/admin-dashboard");
    } catch (error) {
      console.error("Error leaving chat:", error);
    }
  };

  const openDocuments = () => setShowDocuments(true);

  return (
    <Chat client={streamClient} theme="messaging light">
      <div className="flex flex-col w-full flex-1 h-screen">
        {activeChannel ? (
          <Channel channel={activeChannel}>
            <Window>
              <div className="flex items-center justify-between p-2">
                {activeChannel.data?.member_count === 1 ? (
                  <ChannelHeader title="Everyone else has left this chat!" />
                ) : (
                  <ChannelHeader />
                )}

                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={openDocuments}>
                    Documents
                  </Button>

                  <Button variant="outline" onClick={handleCall}>
                    <VideoIcon className="w-4 h-4" />
                    Video Call
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleLeaveChat}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <LogOutIcon className="w-4 h-4" />
                    Leave Chat
                  </Button>
                </div>
              </div>

              <MessageList />
              <div className="sticky bottom-0 w-full">
                <MessageInput focus />
              </div>
            </Window>

            <Thread />
          </Channel>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-2xl font-semibold text-muted-foreground mb-4">
              No Chat Selected
            </h2>
            <p className="text-muted-foreground">
              Select a chat from the sidebar or start a new conversation
            </p>
          </div>
        )}

        {showDocuments && (
          <ChatDocuments onClose={() => setShowDocuments(false)} />
        )}
      </div>
    </Chat>
  );
}

export default AdminDashboard;
  console.log("Stream userID:", streamClient.userID);