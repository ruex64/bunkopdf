"use client";

import { useEffect, useState } from "react";
import { Review, getReviewsByBookId } from "@/lib/firebase";
import StarRating from "./StarRating";
import { User } from "lucide-react";

interface ReviewListProps {
  bookId: string;
  refreshTrigger?: number;
}

export default function ReviewList({ bookId, refreshTrigger }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, [bookId, refreshTrigger]);

  const loadReviews = async () => {
    setLoading(true);
    setError(null);

    try {
      const fetchedReviews = await getReviewsByBookId(bookId);
      setReviews(fetchedReviews);
    } catch (err) {
      console.error("Error loading reviews:", err);
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months !== 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  if (loading) {
    return (
      <div
        className="rounded-lg shadow-md p-6 border"
        style={{
          background: "var(--bg-secondary)",
          borderColor: "var(--border-primary)",
        }}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-6 rounded w-1/3" style={{ background: "var(--bg-tertiary)" }}></div>
          <div className="space-y-3">
            <div className="h-20 rounded" style={{ background: "var(--bg-tertiary)" }}></div>
            <div className="h-20 rounded" style={{ background: "var(--bg-tertiary)" }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-lg shadow-md p-6 border"
        style={{
          background: "var(--bg-secondary)",
          borderColor: "var(--border-primary)",
        }}
      >
        <p style={{ color: "var(--accent)" }}>{error}</p>
      </div>
    );
  }

  const averageRating = calculateAverageRating();

  return (
    <div
      className="rounded-lg shadow-md p-6 border"
      style={{
        background: "var(--bg-secondary)",
        borderColor: "var(--border-primary)",
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Reviews ({reviews.length})
        </h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(averageRating)} readonly size={20} />
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              {averageRating.toFixed(1)} average
            </span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="text-center py-8" style={{ color: "var(--text-muted)" }}>
          No reviews yet. Be the first to review this book!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border-b pb-4 last:border-b-0"
              style={{ borderColor: "var(--border-primary)" }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "var(--bg-tertiary)" }}
                >
                  <User className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {review.name}
                    </h4>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  <div className="mb-2">
                    <StarRating rating={review.rating} readonly size={16} />
                  </div>
                  <p className="whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
                    {review.comment}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
