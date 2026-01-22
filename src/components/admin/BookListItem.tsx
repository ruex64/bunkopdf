"use client";

import { Edit2, Trash2, ExternalLink, FileText } from "lucide-react";
import type { Book } from "@/lib/firebase";

interface BookListItemProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
}

export function BookListItem({ book, onEdit, onDelete }: BookListItemProps) {
  return (
    <div
      className="p-4 rounded-lg border flex gap-4"
      style={{
        background: "var(--bg-secondary)",
        borderColor: "var(--border-primary)",
      }}
    >
      {/* Cover */}
      <div
        className="w-16 h-22 shrink-0 rounded flex items-center justify-center"
        style={{ background: "var(--bg-tertiary)" }}
      >
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <FileText className="w-6 h-6" style={{ color: "var(--text-ghost)" }} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3
          className="text-sm font-medium truncate"
          style={{ color: "var(--text-primary)" }}
        >
          {book.title}
        </h3>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
          {book.author}
        </p>
        {book.category && (
          <span
            className="inline-block text-xs px-1.5 py-0.5 rounded mt-1.5"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-muted)",
            }}
          >
            {book.category}
          </span>
        )}
        <p
          className="text-xs mt-1.5 truncate"
          style={{ color: "var(--text-ghost)" }}
        >
          {book.pdfUrl}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-start gap-1 shrink-0">
        <a
          href={book.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 transition-opacity hover:opacity-70"
          style={{ color: "var(--text-muted)" }}
          title="Open PDF"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
        <button
          onClick={() => onEdit(book)}
          className="p-2 transition-opacity hover:opacity-70"
          style={{ color: "var(--text-muted)" }}
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(book)}
          className="p-2 transition-opacity hover:opacity-70 text-red-500"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
