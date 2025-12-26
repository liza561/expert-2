'use client'
import { useUser } from "@clerk/nextjs"
import { AdminSidebar } from "./AdminSidebar"
import { UserSidebar } from "./UserSidebar"

export function AppSidebar(props: any) {
  const { user } = useUser()
  const role = user?.publicMetadata?.role

  if (role === "admin") {
    return <AdminSidebar {...props} />
  }

  return <UserSidebar {...props} />
}
