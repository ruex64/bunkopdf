"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, ArrowRight, Share2, Check, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";
import type { BookCategory } from "@/lib/firebase";

interface SerializedBook {
  id: string;
  title: string;
  slug: string;
  description: string;
  pdfUrl: string;
  coverUrl?: string;
  category: BookCategory;
  createdAt: string;
  updatedAt: string;
}

interface BookShareClientProps {
  book: SerializedBook;
}

export function BookShareClient({ book }: BookShareClientProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [refreshReviews, setRefreshReviews] = useState(0);

  const handleShare = async () => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: book.title,
          text: book.description || "Check out this book!",
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed, fall back to copy
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRead = () => {
    router.push(`/read/${book.slug}`);
  };

  const handleReviewSubmitted = () => {
    setRefreshReviews((prev) => prev + 1);
  };

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
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl space-y-8">
          {/* Book Card */}
          <div className="max-w-md mx-auto">
            <div
              className="rounded-lg overflow-hidden shadow-lg"
              style={{
                background: "var(--bg-secondary)",
                borderColor: "var(--border-primary)",
              }}
            >
            {/* Cover Image */}
            {book.coverUrl ? (
              <div className="relative aspect-[3/4] w-full">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
                {/* Category Badge */}
                {book.category && (
                  <div
                    className="absolute top-3 left-3 px-2 py-1 text-xs rounded"
                    style={{
                      background: "var(--bg-secondary)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {book.category}
                  </div>
                )}
              </div>
            ) : (
              <div
                className="aspect-[3/4] w-full flex items-center justify-center"
                style={{ background: "var(--bg-tertiary)" }}
              >
                <BookOpen
                  className="w-20 h-20"
                  style={{ color: "var(--text-muted)", opacity: 0.3 }}
                />
              </div>
            )}

            {/* Book Info */}
            <div className="p-6">
              <h1
                className="text-xl font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {book.title}
              </h1>

              {book.description && (
                <p
                  className="text-sm mb-4 line-clamp-3"
                  style={{ color: "var(--text-muted)" }}
                >
                  {book.description}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleRead}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 text-base font-medium rounded-lg transition-opacity hover:opacity-90"
                  style={{
                    background: "var(--accent)",
                    color: "var(--bg-primary)",
                  }}
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Read Book</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm rounded-lg border transition-opacity hover:opacity-80"
                  style={{
                    background: "var(--bg-tertiary)",
                    borderColor: "var(--border-primary)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Share Book</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Browse More */}
          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-sm transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse more books</span>
          </Link>
          </div>

          {/* Reviews Section */}
          <div className="space-y-6">
            <ReviewList bookId={book.id} refreshTrigger={refreshReviews} />
            <ReviewForm bookId={book.id} onReviewSubmitted={handleReviewSubmitted} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
