# Example Page Implementations

This file contains ready-to-use page component examples for integration into your app.

## Advisor Setup Page

File: `app/advisor/setup/page.tsx`

```typescript
"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import AdvisorProfileSetup from "@/components/AdvisorProfileSetup";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AdvisorSetupPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const userProfile = useQuery(api.users.getUserByClerkUserId, {
    userId: user?.id || "",
  });

  if (!isLoaded) return <div>Loading...</div>;

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  // Check if user is advisor
  if (userProfile?.role !== "advisor") {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-semibold">
            Only advisors can access this page.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-red-600 hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdvisorProfileSetup
        userId={user.id}
        onComplete={() => {
          router.push("/advisor-dashboard/earnings");
        }}
      />
    </div>
  );
}
```

---

## Client Wallet Page

File: `app/user-dashboard/wallet/page.tsx`

```typescript
"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Wallet from "@/components/Wallet";

export default function WalletPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  if (!isLoaded) return <div>Loading...</div>;

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">My Wallet</h1>
        <p className="text-gray-600 mb-8">
          Manage your funds and view transaction history
        </p>

        <Wallet userId={user.id} />
      </div>
    </div>
  );
}
```

---

## Advisor Earnings Page

File: `app/advisor-dashboard/earnings/page.tsx`

```typescript
"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import AdvisorEarnings from "@/components/AdvisorEarnings";

export default function EarningsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  if (!isLoaded) return <div>Loading...</div>;

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">Earnings</h1>
        <p className="text-gray-600 mb-8">
          Track your earnings and request withdrawals
        </p>

        <AdvisorEarnings advisorId={user.id} />
      </div>
    </div>
  );
}
```

---

## Admin Dashboard Page

File: `app/admin/dashboard/page.tsx`

```typescript
"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";

export default function AdminDashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  if (!isLoaded) return <div>Loading...</div>;

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  // TODO: Verify user role is admin
  // This check should be done server-side in production

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboard />
    </div>
  );
}
```

---

## Chat Session Page

File: `app/user-dashboard/chats/[sessionId]/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import SessionTimer from "@/components/SessionTimer";
import SessionRating from "@/components/SessionRating";
import { useBillingSession } from "@/lib/billingService";

interface SessionSummary {
  durationSeconds: number;
  totalCharged: number;
  clientWalletAfter: number;
  advisorEarning: number;
}

export default function ChatSessionPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);

  const session = useQuery(api.sessions.getSession, {
    sessionId,
  });

  const { pause, resume, end } = useBillingSession(
    sessionId,
    user?.id || "",
    session?.advisorId || "",
    session?.pricePerMinute || 0.50,
    (warningType) => {
      console.log("Balance warning:", warningType);
    },
    () => {
      console.log("Session paused due to low balance");
    }
  );

  if (!isLoaded || !session) return <div>Loading...</div>;

  if (sessionEnded && sessionSummary) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Session Receipt */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-3xl font-bold mb-6 text-green-600">
              ✓ Session Completed
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-600">Duration</p>
                <p className="text-2xl font-bold">
                  {Math.floor(sessionSummary.durationSeconds / 60)}m{" "}
                  {sessionSummary.durationSeconds % 60}s
                </p>
              </div>
              <div>
                <p className="text-gray-600">Amount Charged</p>
                <p className="text-2xl font-bold text-red-600">
                  ${sessionSummary.totalCharged.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Balance Before</p>
                <p className="text-xl">
                  ${(sessionSummary.clientWalletAfter + sessionSummary.totalCharged).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Balance After</p>
                <p className="text-xl text-green-600">
                  ${sessionSummary.clientWalletAfter.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Rating Component */}
          <SessionRating
            sessionId={sessionId}
            clientId={user!.id}
            advisorId={session.advisorId}
            onComplete={() => {
              setTimeout(() => router.push("/user-dashboard/chats"), 2000);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Chat Session</h1>
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
        </div>

        {/* Session Timer */}
        <SessionTimer
          sessionId={sessionId}
          pricePerMinute={session.pricePerMinute}
          clientId={user!.id}
          advisorId={session.advisorId}
          onSessionEnd={(summary) => {
            setSessionSummary(summary);
            setSessionEnded(true);
          }}
        />

        {/* Chat Area - TODO: Integrate Stream Chat */}
        <div className="bg-white rounded-lg shadow p-8 h-96">
          <p className="text-gray-600 text-center py-20">
            Chat window here (integrate Stream Chat)
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={pause}
            className="flex-1 bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600"
          >
            Pause
          </button>
          <button
            onClick={resume}
            className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600"
          >
            Resume
          </button>
          <button
            onClick={() => {
              end(600, 5.0); // Example: 10 min @ $0.50/min
            }}
            className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600"
          >
            End Session
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Video Session Page

File: `app/user-dashboard/video-call/[id]/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import SessionTimer from "@/components/SessionTimer";
import SessionRating from "@/components/SessionRating";
import { useBillingSession } from "@/lib/billingService";

export default function VideoCallPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  const [sessionEnded, setSessionEnded] = useState(false);

  const session = useQuery(api.sessions.getSession, {
    sessionId,
  });

  const { pause, resume, end } = useBillingSession(
    sessionId,
    user?.id || "",
    session?.advisorId || "",
    session?.pricePerMinute || 1.0,
    (warningType) => {
      console.log("Balance warning:", warningType);
    },
    () => {
      console.log("Session paused");
    }
  );

  if (!isLoaded || !session) return <div>Loading...</div>;

  if (sessionEnded) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <SessionRating
          sessionId={sessionId}
          clientId={user!.id}
          advisorId={session.advisorId}
          onComplete={() => {
            router.push("/user-dashboard");
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Video Grid - TODO: Integrate Stream Video */}
      <div className="flex gap-4 p-4 h-screen">
        <div className="flex-1 bg-gray-800 rounded-lg flex items-center justify-center">
          <p className="text-white">Your Video (Stream Video)</p>
        </div>
        <div className="w-48 bg-gray-800 rounded-lg flex items-center justify-center">
          <p className="text-white text-sm">Advisor (Stream Video)</p>
        </div>
      </div>

      {/* Session Timer Overlay */}
      <div className="fixed bottom-6 left-6 z-50">
        <SessionTimer
          sessionId={sessionId}
          pricePerMinute={session.pricePerMinute}
          clientId={user!.id}
          advisorId={session.advisorId}
          onSessionEnd={(summary) => {
            setSessionEnded(true);
          }}
        />
      </div>

      {/* Controls Overlay */}
      <div className="fixed bottom-6 right-6 flex gap-2 z-50">
        <button
          onClick={pause}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold"
        >
          Pause
        </button>
        <button
          onClick={() => end(600, 10.0)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold"
        >
          End Call
        </button>
      </div>
    </div>
  );
}
```

---

## Browse Advisors Page

File: `app/user-dashboard/advisors/page.tsx`

```typescript
"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export default function BrowseAdvisorsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const advisors = useQuery(api.advisorProfiles.getAllAdvisorProfiles, {});

  if (!isLoaded) return <div>Loading...</div>;

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  const filteredAdvisors = advisors?.filter((advisor) =>
    advisor.specialization.some((spec) =>
      spec.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">Browse Advisors</h1>
        <p className="text-gray-600 mb-8">
          Find expert advisors and book consultations
        </p>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Advisors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdvisors?.map((advisor) => (
            <div
              key={advisor._id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                {/* Advisor Info */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold">{advisor.specialization[0]}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex text-yellow-400">
                      {"★".repeat(Math.round(advisor.averageRating || 0))}
                    </div>
                    <p className="text-sm text-gray-600">
                      ({advisor.totalRatings || 0} reviews)
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-gray-600 text-sm mb-4">
                  {advisor.bio.substring(0, 100)}...
                </p>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600">Chat</p>
                    <p className="text-lg font-bold text-blue-600">
                      ${advisor.chatPricePerMinute}/min
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Video</p>
                    <p className="text-lg font-bold text-green-600">
                      ${advisor.videoPricePerMinute}/min
                    </p>
                  </div>
                </div>

                {/* Availability */}
                <p className="text-xs text-gray-600 mb-4">
                  {advisor.availabilityHours.startTime} -{" "}
                  {advisor.availabilityHours.endTime}
                </p>

                {/* Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/chats/new?advisorId=${advisor.userId}`)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700"
                  >
                    Chat
                  </button>
                  <button
                    onClick={() =>
                      router.push(`/video-call/new?advisorId=${advisor.userId}`)
                    }
                    className="flex-1 bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700"
                  >
                    Video
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAdvisors?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No advisors found</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Session Dispute Page

File: `app/user-dashboard/sessions/[sessionId]/dispute/page.tsx`

```typescript
"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import SessionDispute from "@/components/SessionDispute";

export default function SessionDisputePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const session = useQuery(api.sessions.getSession, {
    sessionId,
  });

  if (!isLoaded) return <div>Loading...</div>;

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  if (!session) return <div>Session not found</div>;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 text-blue-600 hover:text-blue-700 font-semibold"
        >
          ← Back
        </button>

        <SessionDispute
          sessionId={sessionId}
          clientId={user.id}
          advisorId={session.advisorId}
          onSubmit={() => {
            router.push("/user-dashboard/sessions");
          }}
        />
      </div>
    </div>
  );
}
```

---

These examples provide a complete foundation for integrating the billing system into your application. Customize as needed for your specific UI/UX requirements.
