"use client";

import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import StarRating from "./StarRating";

interface ReviewFormProps {
  bookId: string;
  onReviewSubmitted?: () => void;
}

export default function ReviewForm({
  bookId,
  onReviewSubmitted,
}: ReviewFormProps) {
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!comment.trim()) {
      setError("Please enter a comment");
      return;
    }

    if (rating === 0) {
      setError("Please select a star rating");
      return;
    }

    if (!captchaToken) {
      setError("Please complete the captcha verification");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId,
          name: name.trim(),
          comment: comment.trim(),
          rating,
          captchaToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      // Reset form
      setName("");
      setComment("");
      setRating(0);
      setCaptchaToken(null);
      setSuccess(true);

      // Notify parent component
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Write a Review
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
          >
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            maxLength={100}
            disabled={isSubmitting}
          />
        </div>

        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Rating <span className="text-red-500">*</span>
          </label>
          <StarRating rating={rating} onRatingChange={setRating} />
        </div>

        {/* Comment Field */}
        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
          >
            Comment <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this book..."
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-vertical"
            maxLength={1000}
            disabled={isSubmitting}
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {comment.length}/1000 characters
          </div>
        </div>

        {/* Cloudflare Turnstile Captcha */}
        <div>
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
            onSuccess={(token) => setCaptchaToken(token)}
            onError={() => {
              setCaptchaToken(null);
              setError("Captcha verification failed. Please try again.");
            }}
            onExpire={() => setCaptchaToken(null)}
            options={{
              theme: "auto",
              size: "normal",
            }}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-3 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 rounded-lg text-sm">
            Review submitted successfully!
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
