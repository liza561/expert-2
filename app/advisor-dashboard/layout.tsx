"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdvisorLayout({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    // Check if user is logged in
    if (!userId || !user) {
      router.push("/sign-in");
      return;
    }

    // Check if user has advisor role in metadata
    const userRole = user.publicMetadata?.role as string | undefined;
    if (userRole !== "advisor") {
      // If not an advisor, redirect to user dashboard or sign-in
      router.push("/user-dashboard");
      return;
    }

    setIsAuthorized(true);
  }, [userId, user, isLoaded, router]);

  if (!isLoaded || !isAuthorized) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}
