"use client";

export default function ChatsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="w-full p-6">
      {children}
    </main>
  );
}
