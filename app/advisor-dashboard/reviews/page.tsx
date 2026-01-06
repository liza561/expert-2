"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from "next/navigation";

export default function AdvisorReviewsPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [sortBy, setSortBy] = useState<"recent" | "highest" | "lowest">("recent");

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch sessions with ratings
  const sessions = useQuery(api.sessions.getAdvisorSessions, { advisorId: userId });

  const reviews = sessions
    ?.filter((s) => s.rating && s.rating > 0)
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "highest") {
        return (b.rating || 0) - (a.rating || 0);
      } else {
        return (a.rating || 0) - (b.rating || 0);
      }
    }) || [];

  const stats = {
    totalReviews: reviews.length,
    averageRating:
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        : 0,
    fiveStarCount: reviews.filter((r) => r.rating === 5).length,
    fourStarCount: reviews.filter((r) => r.rating === 4).length,
    threeStarCount: reviews.filter((r) => r.rating === 3).length,
    twoStarCount: reviews.filter((r) => r.rating === 2).length,
    oneStarCount: reviews.filter((r) => r.rating === 1).length,
  };

  const ratingDistribution = [
    { stars: 5, count: stats.fiveStarCount },
    { stars: 4, count: stats.fourStarCount },
    { stars: 3, count: stats.threeStarCount },
    { stars: 2, count: stats.twoStarCount },
    { stars: 1, count: stats.oneStarCount },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.back()}
            className="mb-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
          >
            ← Back
          </Button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">⭐ Reviews & Feedback</h1>
          <p className="text-gray-600">See what your clients think about your sessions</p>
        </div>

        {/* Rating Summary Card */}
        <Card className="p-8 bg-linear-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Overall Rating */}
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600 uppercase mb-3">Overall Rating</p>
              <p className="text-6xl font-bold text-yellow-600 mb-2">
                {stats.averageRating.toFixed(1)}
              </p>
              <div className="text-2xl mb-3">
                {"⭐".repeat(Math.floor(stats.averageRating))}
                {stats.averageRating % 1 >= 0.5 && "½"}
              </div>
              <p className="text-sm text-gray-700 font-semibold">
                Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Rating Breakdown */}
            <div className="md:col-span-2">
              <p className="text-sm font-semibold text-gray-600 uppercase mb-4">Rating Distribution</p>
              <div className="space-y-3">
                {ratingDistribution.map(({ stars, count }) => (
                  <div key={stars} className="flex items-center gap-3">
                    <span className="text-lg font-bold text-yellow-600 w-12 text-right">
                      {"⭐".repeat(stars)}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-yellow-500 h-full transition-all"
                        style={{
                          width: `${
                            stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Sort Controls */}
        <Card className="p-6 mb-8 bg-white border-2 border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Sort by</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="w-full p-2 border-2 border-gray-300 rounded-lg font-semibold text-gray-800 bg-white hover:border-yellow-500 focus:outline-none focus:border-yellow-600"
          >
            <option value="recent">📅 Most Recent</option>
            <option value="highest">⭐ Highest Rated</option>
            <option value="lowest">⭐ Lowest Rated</option>
          </select>
        </Card>

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review._id} className="p-6 bg-white hover:shadow-lg transition-shadow border-2 border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Rating Stars */}
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{"⭐".repeat(review.rating || 0)}</span>
                    <div>
                      <p className="text-lg font-bold text-yellow-600 mb-1">{review.rating}/5</p>
                      <p className="text-xs text-gray-600">
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Session Info */}
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase mb-2">Session</p>
                    <p className="font-semibold text-gray-900 mb-1">
                      {review.type === "chat" ? "💬 Chat" : "📹 Video"} with {review.clientName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Duration: {review.durationMinutes} minutes
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-600 uppercase mb-2">Amount</p>
                    <p className="text-3xl font-bold text-green-600">
                      ₹{(review.totalCost || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Feedback */}
                {review.feedback && (
                  <div className="mt-4 pt-4 border-t-2 border-gray-200">
                    <p className="text-sm font-semibold text-gray-600 mb-2">💬 Feedback</p>
                    <p className="text-gray-700 italic">"{review.feedback}"</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center bg-white border-2 border-gray-200">
            <p className="text-4xl mb-4">⭐</p>
            <p className="text-2xl font-bold text-gray-900 mb-2">No Reviews Yet</p>
            <p className="text-gray-600 mb-6">
              Reviews will appear here as clients complete sessions and leave ratings. Keep providing excellent service!
            </p>
            <Button
              onClick={() => router.push("/advisor-dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Go to Dashboard
            </Button>
          </Card>
        )}

        {/* Tips Card */}
        <Card className="p-6 bg-blue-50 border-2 border-blue-300 mt-8">
          <h3 className="font-bold text-lg text-blue-900 mb-3">💡 Tips to Improve Your Ratings</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✓ Be professional and punctual for sessions</li>
            <li>✓ Listen actively and ask clarifying questions</li>
            <li>✓ Provide actionable insights and advice</li>
            <li>✓ Maintain clear communication</li>
            <li>✓ Follow up with resources and recommendations</li>
            <li>✓ Respond promptly to client messages</li>
            <li>✓ Continuously improve your expertise</li>
          </ul>
        </Card>

        {/* Action Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => router.push("/advisor-dashboard")}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
