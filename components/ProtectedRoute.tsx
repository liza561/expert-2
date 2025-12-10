"use client";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface Props {
  allowedRoles: string[];
  redirectPath?: string;
  children: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, redirectPath = "/", children }: Props) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.replace("/sign-in");
      return;
    }

    if (!allowedRoles.includes(user.publicMetadata.role)) {
      router.replace(redirectPath);
    }
  }, [user, isLoaded, router, allowedRoles, redirectPath]);

  if (!isLoaded || !user || !allowedRoles.includes(user?.publicMetadata.role)) {
    return <p>Loading...</p>;
  }

  return <>{children}</>;
}
