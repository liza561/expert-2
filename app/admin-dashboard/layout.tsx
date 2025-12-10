"use client";
import UserSyncWrapper from '@/components/UserSyncWrapper';
import { Chat } from "stream-chat-react";
import streamClient from '@/lib/stream';
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import Link from "next/link";
import "stream-chat-react/dist/css/v2/index.css";

import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Pages that should NOT show sidebar
  const noSidebarRoutes = [
    "/chats",
    "/admin-dashboard/chats",
  ];

  const hideSidebar = noSidebarRoutes.some(route =>
    pathname.startsWith(route)
  );

  return (
    <UserSyncWrapper>
      <Chat client={streamClient}>
        {hideSidebar ? (
          // NO SIDEBAR LAYOUT
          <main className="w-full p-4">
            {children}
          </main>
        ) : (
          //  SIDEBAR LAYOUT (default)
          <SidebarProvider style={{ "--sidebar-width": "19rem" } as React.CSSProperties}>
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-16 shrink-0 items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                <Link href="/admin-dashboard">
                  <h1 className="text-lg font-bold tracking-wider uppercase">
                    Admin Panel
                  </h1>
                </Link>
              </header>

              <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                {children}
              </div>
            </SidebarInset>
          </SidebarProvider>
        )}
      </Chat>
    </UserSyncWrapper>
  );
}
