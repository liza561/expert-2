"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";

export const useOnlineStatus = () => {
  const { user } = useUser();
  const setOnline = useMutation(api.users.setOnlineStatus);

  useEffect(() => {
    if (!user) return;

    // Mark user online immediately
    setOnline({ userId: user.id, isOnline: true });

    // Heartbeat every 20 sec
    const interval = setInterval(() => {
      setOnline({ userId: user.id, isOnline: true });
    }, 20000);

    // On tab close → mark offline
    const goOffline = () => {
      setOnline({ userId: user.id, isOnline: false });
    };

    window.addEventListener("beforeunload", goOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", goOffline);
      setOnline({ userId: user.id, isOnline: false });
    };
  }, [user, setOnline]);
};
