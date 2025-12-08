"use client";
import React, { use, useCallback, useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import streamClient from '@/lib/stream';
import { createToken } from '@/actions/createToken';

function UserSyncWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoaded:isUserLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createOrUpdateUser = useMutation(api.users.upsertUser);

  const syncUser = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const tokenProvider = async () => {
        if (!user?.id) throw new Error("User not authenticated");
        return await createToken(user.id);
      };

      // Save user in Convex
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

      // Connect Stream
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
    } catch (err) {
      console.error("Error syncing user data:", err);
      setError(err instanceof Error ? err.message : "Failed to sync user");
    } finally {
      setIsLoading(false);
    }
  }, [user, createOrUpdateUser]);

  const disconnectUser = useCallback(async () => {
    try {
      await streamClient.disconnectUser();
    } catch (err) {
      console.error("Error disconnecting user from Stream:", err);
    }
  }, []);

  useEffect(() => {
    // Wait until Clerk fully loads user state
    if (!isUserLoaded) return;

    if (user) {
      syncUser();
    } else {
      disconnectUser();
      setIsLoading(false);
    }

    return () => {
      if (!user) disconnectUser();
    };
  }, [isUserLoaded, user, syncUser, disconnectUser]);

  // Loading state
  if (!isUserLoaded || isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner
        size="lg"
        message={!isUserLoaded ? "Loading ..." : "Syncing user data..."}
      />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 items-center justify-center bg-white px-6">
        <p className='text-red-500 text-lg font-semibold mb-2'>
          Sync Error: {error}
        </p>
        <p className='text-gray-600 text-center mb-4'>{error}</p>
        <p className='text-gray-500 text-sm text-center'>
          Please try restarting the app or contact support if the issue persists.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

export default UserSyncWrapper;
