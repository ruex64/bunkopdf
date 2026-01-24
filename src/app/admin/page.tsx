"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Admin functionality has been merged into the main page
// This page now redirects to home
export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div
      className="h-screen flex items-center justify-center"
      style={{ background: "var(--bg-primary)" }}
    >
      <p style={{ color: "var(--text-muted)" }}>Redirecting...</p>
    </div>
  );
}
