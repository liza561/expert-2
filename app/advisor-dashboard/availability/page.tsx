"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AvailabilityRedirect() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl mb-4">📅</p>
        <p className="text-2xl font-bold text-gray-900 mb-4">Availability Settings</p>
        <p className="text-gray-600 mb-6">
          Availability settings have been moved to the Pricing & Availability page
        </p>
        <Button
          onClick={() => router.push("/advisor-dashboard/pricing")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Go to Pricing & Availability →
        </Button>
      </div>
    </div>
  );
}
