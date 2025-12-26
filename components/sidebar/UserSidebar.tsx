'use client'
import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { UserButton, useUser } from "@clerk/nextjs"
import { ChannelList } from "stream-chat-react"
import { ChannelFilters, ChannelSort } from "stream-chat"
import { NewChatDialog } from "@/components/NewChatDialog"
import { useRouter } from "next/navigation"

export function UserSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()
  const router = useRouter()

  const filters: ChannelFilters = {
    members: { $in: [user?.id as string] },
    type: { $in: ["messaging"] },
  }

  const sort: ChannelSort = { last_message_at: -1 }
  const options = { presence: true, state: true }

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex justify-between w-full">
                <div>
                  <p className="text-xs text-muted-foreground">Welcome</p>
                  <p className="font-semibold">
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>
                <UserButton />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            <NewChatDialog>
              <Button variant="outline" className="w-full">
                Start New Chat
              </Button>
            </NewChatDialog>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/user-dashboard/chats")}
            >
               Chats
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/user-dashboard/bookings")}
            >
              Your Bookings 
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/user-dashboard/documents")}
            >
              Your Documents
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/user-dashboard/wallet ")}
            >
             Wallet 
            </Button>
            <ChannelList
              filters={filters}
              sort={sort}
              options={options}
            />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
