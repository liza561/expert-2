"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

export default function BrowseAdvisorsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "price-low" | "price-high">(
    "rating"
  );

  const advisors = useQuery((api as any).advisorProfiles.getAllAdvisorProfiles, {}) as any[] | undefined;
  const wallet = useQuery((api as any).wallet.getWallet, { userId: user?.id || "" }) as any | undefined;

  const filteredAdvisors = useMemo(() => {
    if (!advisors) return [];

    let filtered = advisors.filter((advisor: any) => {
      const matchesSearch =
        searchTerm === "" ||
        advisor.specialization.some((spec: any) =>
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        advisor.bio.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });

    // Sort
    switch (sortBy) {
      case "rating":
        return filtered.sort(
          (a: any, b: any) => (b.averageRating || 0) - (a.averageRating || 0)
        );
      case "price-low":
        return filtered.sort((a: any, b: any) => a.chatPricePerMinute - b.chatPricePerMinute);
      case "price-high":
        return filtered.sort((a: any, b: any) => b.chatPricePerMinute - a.chatPricePerMinute);
      default:
        return filtered;
    }
  }, [advisors, searchTerm, sortBy]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    router.replace("/sign-in");
    return null;
  }

  const handleStartSession = (
  userId: string,
  sessionType: "chat" | "video"
) => {
  if (!wallet) {
    router.push("/user-dashboard/wallet");
    return;
  }

  const advisor = advisors?.find((a: any) => a.userId === userId);
  if (!advisor) return;

  const pricePerMinute =
    sessionType === "chat"
      ? advisor.chatPricePerMinute
      : advisor.videoPricePerMinute;

  const minBalance = pricePerMinute * 1;

  if (wallet.balance < minBalance) {
    alert(
      `Minimum balance required: ₹${minBalance.toFixed(
        2
      )}. Please add funds to your wallet.`
    );
    router.push("/user-dashboard/wallet");
    return;
  }

  // ✅ CORRECT ROUTING
  if (sessionType === "chat") {
    router.push(`/user-dashboard/messaging?chatUser=${userId}`);
  } else {
    router.push(`/user-dashboard/video-call/${userId}`);
  }
};

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold mb-2">Browse Advisors 🔍</h1>
          <p className="text-blue-100">Find expert advisors for your consultation</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search
              </label>
              <Input
                placeholder="Search specializations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "rating" | "price-low" | "price-high")
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="rating">⭐ Highest Rated</option>
                <option value="price-low">💰 Price: Low to High</option>
                <option value="price-high">💸 Price: High to Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Balance
              </label>
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">
                  ₹{wallet?.balance.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6">
          <p className="text-gray-600 font-semibold">
            Found {filteredAdvisors.length} advisor{filteredAdvisors.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Advisors Grid */}
        {filteredAdvisors && filteredAdvisors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAdvisors.map((advisor: any) => (
              <Card
                key={advisor._id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {/* Card Header */}
                <div className="bg-linear-to-r from-blue-500 to-blue-600 text-white p-4">
                  <h3 className="text-lg font-bold">{advisor.specialization[0] || "Expert"}</h3>
                  {advisor.specialization.length > 1 && (
                    <p className="text-sm text-blue-100">
                      +{advisor.specialization.length - 1} more specializations
                    </p>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  {/* Rating */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex text-yellow-400 text-lg">
                        {"★".repeat(Math.round(advisor.averageRating || 0))}
                        {"☆".repeat(5 - Math.round(advisor.averageRating || 0))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {advisor.totalRatings || 0} reviews
                    </p>
                  </div>

                  {/* Profile Completion */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-700">Profile Completion</p>
                      <p className="text-xs font-bold text-blue-600">
                        {advisor.profileCompletion}%
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${advisor.profileCompletion}%` }}
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-gray-600 line-clamp-3">{advisor.bio}</p>

                  {/* Specializations */}
                  <div className="flex flex-wrap gap-2">
                    {advisor.specialization.slice(0, 3).map((spec: any) => (
                      <span
                        key={spec}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold"
                      >
                        {spec}
                      </span>
                    ))}
                    {advisor.specialization.length > 3 && (
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">
                        +{advisor.specialization.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-600">💬 Chat</p>
                        <p className="text-lg font-bold text-blue-600">
                          ₹{advisor.chatPricePerMinute}/min
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">📹 Video</p>
                        <p className="text-lg font-bold text-green-600">
                          ₹{advisor.videoPricePerMinute}/min
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="text-xs text-gray-600 bg-amber-50 p-3 rounded-lg">
                    <p className="font-semibold mb-1">⏰ Available:</p>
                    <p>
                      {advisor.availabilityHours.startTime} -{" "}
                      {advisor.availabilityHours.endTime}
                    </p>
                    <p>{advisor.availabilityHours.daysOfWeek.join(", ")}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleStartSession(advisor.userId, "chat")}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
                    >
                      💬 Chat
                    </Button>
                    <Button
                      onClick={() => handleStartSession(advisor.userId, "video")}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2"
                    >
                      📹 Video
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Advisors Found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filters
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSortBy("rating");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}