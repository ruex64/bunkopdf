"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  return (
    <header
      className="h-12 shrink-0 flex items-center justify-between px-4 border-b"
      style={{
        background: "var(--bg-secondary)",
        borderColor: "var(--border-primary)",
      }}
    >
      <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
        <BookOpen className="w-5 h-5" style={{ color: "var(--accent)" }} />
        <span
          className="text-base font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          BunkoPDF
        </span>
      </Link>

      <ThemeToggle />
    </header>
  );
}
