"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import LoadingSpinner from "@/components/LoadingSpinner";
import streamClient from '@/lib/stream';
import { createToken } from "@/actions/createToken";

function UserSyncWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoaded: isUserLoaded } = useUser();

  const createOrUpdateUser = useMutation(api.users.upsertUser);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prevent duplicate Stream connections
  const hasConnectedRef = useRef(false);

  const syncUser = useCallback(async () => {
    if (!user?.id || hasConnectedRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      // 1️⃣ Save user in Convex
      await createOrUpdateUser({
        userId: user.id,
        name:
          user.fullName ||
          user.firstName ||
          user.emailAddresses[0]?.emailAddress ||
          "Unknown User",
        email: user.emailAddresses[0]?.emailAddress || "",
        imageURL: user.imageUrl || "",
      });

      // 2️⃣ Stream token provider
      const tokenProvider = async () => {
        return await createToken(user.id);
      };

      // 3️⃣ Connect Stream user (ONLY ONCE)
      await streamClient.connectUser(
        {
          id: user.id,
          name:
            user.fullName ||
            user.firstName ||
            user.emailAddresses[0]?.emailAddress ||
            "Unknown User",
          image: user.imageUrl || "",
        },
        tokenProvider
      );

      hasConnectedRef.current = true;
    } catch (err) {
      console.error("Error syncing user data:", err);
      setError(err instanceof Error ? err.message : "Failed to sync user");
    } finally {
      setIsLoading(false);
    }
  }, [user, createOrUpdateUser]);

  useEffect(() => {
    if (!isUserLoaded) return;

    if (user) {
      syncUser();
    } else {
      // User logged out
      hasConnectedRef.current = false;
      streamClient.disconnectUser().catch(console.error);
      setIsLoading(false);
    }

    return () => {
      // Cleanup ONLY on unmount
      hasConnectedRef.current = false;
    };
  }, [isUserLoaded, user, syncUser]);

  // 🔄 Loading
  if (!isUserLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner
          size="lg"
          message={!isUserLoaded ? "Loading..." : "Syncing user data..."}
        />
      </div>
    );
  }

  // ❌ Error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <p className="text-red-500 text-lg font-semibold mb-2">
          Sync Error
        </p>
        <p className="text-gray-600 text-center mb-4">{error}</p>
        <p className="text-gray-500 text-sm text-center">
          Please refresh or contact support if the issue persists.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

export default UserSyncWrapper;
