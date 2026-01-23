"use client";

import Link from "next/link";
import { BookOpen, FileText } from "lucide-react";
import type { Book } from "@/lib/firebase";
import { getReadingProgress } from "@/lib/readingProgress";
import { useEffect, useState } from "react";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const [savedPage, setSavedPage] = useState<number | null>(null);

  useEffect(() => {
    const page = getReadingProgress(book.id);
    if (page > 1) {
      setSavedPage(page);
    }
  }, [book.id]);

  // Build reader URL with encoded parameters
  const readerUrl = `/read/${book.id}?url=${encodeURIComponent(book.pdfUrl)}&title=${encodeURIComponent(book.title)}`;

  return (
    <div
      className="p-4 rounded-lg border transition-all hover:border-[var(--accent)]"
      style={{
        background: "var(--bg-secondary)",
        borderColor: "var(--border-primary)",
      }}
    >
      <div className="flex gap-4">
        {/* Cover Image or Placeholder */}
        <div
          className="w-20 h-28 shrink-0 rounded flex items-center justify-center"
          style={{ background: "var(--bg-tertiary)" }}
        >
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <FileText
              className="w-8 h-8"
              style={{ color: "var(--text-ghost)" }}
            />
          )}
        </div>

        {/* Book Info */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-base font-medium truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {book.title}
          </h3>
          {book.category && (
            <span
              className="inline-block text-xs px-1.5 py-0.5 rounded mt-1"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-muted)",
              }}
            >
              {book.category}
            </span>
          )}
          {book.description && (
            <p
              className="text-sm mt-2 line-clamp-2"
              style={{ color: "var(--text-muted)" }}
            >
              {book.description}
            </p>
          )}
        </div>
      </div>

      {/* Read Button */}
      <Link
        href={readerUrl}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm rounded transition-opacity hover:opacity-80"
        style={{
          background: "var(--accent)",
          color: "var(--bg-primary)",
        }}
      >
        <BookOpen className="w-4 h-4" />
        <span>{savedPage ? `Continue (p. ${savedPage})` : "Read PDF"}</span>
      </Link>
    </div>
  );
}
