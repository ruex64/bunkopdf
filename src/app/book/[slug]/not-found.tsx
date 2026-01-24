import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Header */}
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
      </header>

      {/* Not Found */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <BookOpen
          className="w-16 h-16 mb-4"
          style={{ color: "var(--text-muted)", opacity: 0.5 }}
        />
        <h1
          className="text-xl font-semibold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Book Not Found
        </h1>
        <p className="mb-6" style={{ color: "var(--text-muted)" }}>
          The book you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 rounded transition-opacity hover:opacity-80"
          style={{
            background: "var(--accent)",
            color: "var(--bg-primary)",
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </Link>
      </main>
    </div>
  );
}
