"use client";

import Link from "next/link";
import { BookOpen, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
  showAdminLink?: boolean;
}

export function Header({ showAdminLink = true }: HeaderProps) {
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
          KirokuMD Books
        </span>
      </Link>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        {showAdminLink && (
          <Link
            href="/admin"
            className="p-2 transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
            title="Admin Panel"
          >
            <Settings className="w-5 h-5" />
          </Link>
        )}
      </div>
    </header>
  );
}
