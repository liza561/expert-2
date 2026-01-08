"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { Button } from "./ui/button";
import { useUser } from "@clerk/nextjs";
function Header() {
    const pathname = usePathname();
    const isUserDashboard = pathname.startsWith("/user-dashboard");
    const isAdminDashboard = pathname.startsWith("/admin-dashboard");
    const { user } = useUser();
    const ROLES = user?.publicMetadata?.role;
    return (
        <header className="flex items-center justify-between px-4 h-15 sm:px-6">
            <Link href="/" className="font-medium uppercase tracking-widest">
                Liza
            </Link>
            <div className="flex items-center gap-2">
                <Authenticated>
                    {!isUserDashboard && !isAdminDashboard && (
                        <Link href={ROLES === "admin" ? "/admin-dashboard" : "/user-dashboard"}>
                            <Button variant="outline">Dashboard</Button>
                        </Link>
                    )}
                    <UserButton />
                </Authenticated>

                <Unauthenticated>
                    <SignInButton 
                        mode="modal"
                    >
                        <Button variant="outline">Sign In </Button>
                    </SignInButton>
                </Unauthenticated>
            </div>
        </header>
    );
}

export default Header;
