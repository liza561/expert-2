"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter,useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect,useState  } from "react";
import {
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  Window,
  useChatContext,
} from "stream-chat-react";
import streamClient from "@/lib/stream";
import { useSidebar } from "@/components/ui/sidebar";
import ChatDocuments from "@/components/ChatDocuments";
import UserDashboard from "@/app/user-dashboard/page";
import { VideoIcon, LogOutIcon } from "lucide-react";
import AdvisorDashboard from "@/app/advisor-dashboard/page";

export default function UserDashboardInner() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setOpen } = useSidebar();
  const { userId } = useAuth();
  const { channel: activeChannel, setActiveChannel } = useChatContext();
  const chatUserId = searchParams?.get("chatUser");
  const [showDocuments, setShowDocuments] = useState(false);

  if (!isLoaded) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  const role = user?.publicMetadata?.role;
  if (role !== "user") return <AdvisorDashboard />;

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
    router.push(`/user-dashboard/video-call/${activeChannel.id}`);
    setOpen(false);
  };

  const handleLeaveChat = async () => {
    if (!activeChannel || !user?.id) return;
    if (!confirm("Leave chat?")) return;

    await activeChannel.removeMembers([user.id]);
    setActiveChannel(undefined);
    router.push("/user-dashboard/messaging");
  };

  // Queries
  
  // Loading state
  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Loading user dashboard...</p>
        </div>
      </div>
    );
  }


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