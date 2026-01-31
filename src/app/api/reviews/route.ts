import { NextRequest, NextResponse } from "next/server";
import { addReview } from "@/lib/firebase";

// Verify Cloudflare Turnstile token
async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error("[Turnstile] Secret key not configured");
    return false;
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
        }),
      }
    );

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("[Turnstile] Verification error:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, name, comment, rating, captchaToken } = body;

    // Validate required fields
    if (!bookId || typeof bookId !== "string") {
      return NextResponse.json(
        { error: "Book ID is required" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== "string" || comment.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment is required" },
        { status: 400 }
      );
    }

    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (!captchaToken || typeof captchaToken !== "string") {
      return NextResponse.json(
        { error: "Captcha token is required" },
        { status: 400 }
      );
    }

    // Verify captcha
    const isValidCaptcha = await verifyTurnstileToken(captchaToken);

    if (!isValidCaptcha) {
      return NextResponse.json(
        { error: "Captcha verification failed" },
        { status: 400 }
      );
    }

    // Add review to database
    const reviewId = await addReview({
      bookId,
      name: name.trim(),
      comment: comment.trim(),
      rating,
    });

    return NextResponse.json(
      {
        success: true,
        reviewId,
        message: "Review submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Error submitting review:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
