"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AdminEarningsPage() {
  const [total, setTotal] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/earnings", {
      cache: "no-store", // 🔥 CRITICAL FIX
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("EARNINGS UI:", data);
        setTotal(data.total ?? 0);
      });
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-lg">
      <Button variant="outline" onClick={() => router.push("/admin-dashboard")}>
        ← Back to Dashboard
      </Button>

      <h1 className="text-2xl font-semibold">Your Earnings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Total Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-green-600">
            ₹ {total === null ? "Loading..." : total}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
