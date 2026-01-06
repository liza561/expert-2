"use client";

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Wallet from "@/components/Wallet";

export default function WalletPage() {
  const { userId } = useAuth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <Wallet userId={userId} />;
}
