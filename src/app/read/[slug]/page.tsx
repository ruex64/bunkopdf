"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  BookOpen,
  Bookmark,
  Share2,
  Check,
  RotateCcw,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getBookBySlug, type Book } from "@/lib/firebase";
import { getReadingProgress, setReadingProgress } from "@/lib/readingProgress";

function ReaderContent() {
  const params = useParams();
  const slug = params.slug as string;

  const [book, setBook] = useState<Book | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(true);
  const [bookLoading, setBookLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBookmark, setShowBookmark] = useState(false);
  const [copied, setCopied] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch book data
  useEffect(() => {
    async function fetchBook() {
      try {
        const fetchedBook = await getBookBySlug(slug);
        setBook(fetchedBook);

        // Load saved progress
        if (fetchedBook) {
          const savedPage = getReadingProgress(fetchedBook.id);
          setCurrentPage(savedPage);
        }
      } catch (err) {
        console.error("Error fetching book:", err);
        setError("Failed to load book");
      } finally {
        setBookLoading(false);
      }
    }

    if (slug) {
      fetchBook();
    }
  }, [slug]);

  // Save progress with debounce
  const saveProgress = useCallback(
    (page: number) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        if (book) {
          setReadingProgress(book.id, page);
          // Show bookmark indicator
          setShowBookmark(true);
          setTimeout(() => setShowBookmark(false), 1500);
        }
      }, 500);
    },
    [book]
  );

  // Update page and save progress
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && (!totalPages || newPage <= totalPages)) {
        setCurrentPage(newPage);
        saveProgress(newPage);
      }
    },
    [totalPages, saveProgress]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        handlePageChange(currentPage - 1);
      } else if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        handlePageChange(currentPage + 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        handlePageChange(1);
      } else if (e.key === "End" && totalPages) {
        e.preventDefault();
        handlePageChange(totalPages);
      } else if (e.key === "Escape" && isFullscreen) {
        e.preventDefault();
        handleExitFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages, handlePageChange, isFullscreen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Touch/swipe navigation for mobile
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swipe left - next page
          handlePageChange(currentPage + 1);
        } else {
          // Swipe right - previous page
          handlePageChange(currentPage - 1);
        }
      }
    };

    const container = canvasContainerRef.current;
    if (container) {
      container.addEventListener("touchstart", handleTouchStart, { passive: true });
      container.addEventListener("touchend", handleTouchEnd, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [currentPage, handlePageChange]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 25, 200));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 25, 50));
  const handleResetZoom = () => setZoom(100);

  const handleFullscreen = async () => {
    if (containerRef.current) {
      try {
        await containerRef.current.requestFullscreen();
      } catch (err) {
        console.error("Fullscreen error:", err);
      }
    }
  };

  const handleExitFullscreen = async () => {
    try {
      await document.exitFullscreen();
    } catch (err) {
      console.error("Exit fullscreen error:", err);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/book/${slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: book?.title || "BunkoPDF Book",
          url: shareUrl,
        });
      } catch {
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

  // Loading state while fetching book
  if (bookLoading) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
          />
          <p style={{ color: "var(--text-muted)" }}>Loading book...</p>
        </div>
      </div>
    );
  }

  // Book not found
  if (!book) {
    return (
      <div
        className="h-screen flex flex-col items-center justify-center p-6"
        style={{ background: "var(--bg-primary)" }}
      >
        <BookOpen
          className="w-12 h-12 mb-3"
          style={{ color: "var(--text-muted)", opacity: 0.5 }}
        />
        <p className="mb-4" style={{ color: "var(--text-muted)" }}>
          Book not found
        </p>
        <Link
          href="/"
          className="px-4 py-2 text-sm rounded transition-opacity hover:opacity-80"
          style={{
            background: "var(--accent)",
            color: "var(--bg-primary)",
          }}
        >
          Back to Library
        </Link>
      </div>
    );
  }

  // Build PDF URL with page parameter - using Google Docs viewer to prevent download
  // This embeds the PDF without download options
  const viewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(book.pdfUrl)}`;

  return (
    <div
      ref={containerRef}
      className="h-screen flex flex-col"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Header */}
      <header
        className="h-12 shrink-0 flex items-center justify-between px-3 sm:px-4 border-b"
        style={{
          background: "var(--bg-secondary)",
          borderColor: "var(--border-primary)",
        }}
      >
        {/* Left: Back & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm transition-opacity hover:opacity-70 shrink-0"
            style={{ color: "var(--text-muted)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Library</span>
          </Link>
          <div
            className="w-px h-5 hidden sm:block"
            style={{ background: "var(--border-primary)" }}
          />
          <h1
            className="text-sm font-medium truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {book.title}
          </h1>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1">
          {/* Bookmark indicator */}
          {showBookmark && (
            <div
              className="flex items-center gap-1 px-2 py-1 text-xs rounded animate-pulse"
              style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
            >
              <Bookmark className="w-3 h-3" />
              <span className="hidden sm:inline">Saved</span>
            </div>
          )}

          <button
            onClick={handleShare}
            className="p-2 rounded transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
            title="Share"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          </button>

          <ThemeToggle />
        </div>
      </header>

      {/* PDF Viewer */}
      <div ref={canvasContainerRef} className="flex-1 relative overflow-hidden">
        {loading && (
          <div
            className="absolute inset-0 flex items-center justify-center z-10"
            style={{ background: "var(--bg-primary)" }}
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
              />
              <p style={{ color: "var(--text-muted)" }}>Loading PDF...</p>
            </div>
          </div>
        )}

        {error && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center z-10"
            style={{ background: "var(--bg-primary)" }}
          >
            <p className="mb-4" style={{ color: "var(--text-muted)" }}>
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded transition-opacity hover:opacity-80"
              style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        )}

        <iframe
          src={viewerUrl}
          className="w-full h-full border-0"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError("Failed to load PDF");
          }}
          title={book.title}
          sandbox="allow-scripts allow-same-origin"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
            width: zoom !== 100 ? `${10000 / zoom}%` : "100%",
            height: zoom !== 100 ? `${10000 / zoom}%` : "100%",
          }}
        />
      </div>

      {/* Bottom Toolbar */}
      <div
        className="h-14 shrink-0 flex items-center justify-between px-3 sm:px-4 border-t"
        style={{
          background: "var(--bg-secondary)",
          borderColor: "var(--border-primary)",
        }}
      >
        {/* Page Navigation */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-2 rounded transition-opacity hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: "var(--text-muted)" }}
            title="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1 sm:gap-2">
            <input
              type="number"
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value) || 1;
                handlePageChange(page);
              }}
              min={1}
              max={totalPages || undefined}
              className="w-12 sm:w-16 px-2 py-1 text-sm text-center rounded border outline-none focus:border-[var(--accent)]"
              style={{
                background: "var(--bg-primary)",
                borderColor: "var(--border-primary)",
                color: "var(--text-primary)",
              }}
            />
            {totalPages && (
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                / {totalPages}
              </span>
            )}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={totalPages !== null && currentPage >= totalPages}
            className="p-2 rounded transition-opacity hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: "var(--text-muted)" }}
            title="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Reading Progress Indicator - Mobile */}
        <div
          className="hidden xs:flex sm:flex items-center gap-1 text-xs"
          style={{ color: "var(--text-ghost)" }}
        >
          <Bookmark className="w-3 h-3" />
          <span className="hidden sm:inline">Auto-saved</span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="p-2 rounded transition-opacity hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed hidden sm:block"
            style={{ color: "var(--text-muted)" }}
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetZoom}
            className="px-2 py-1 text-xs rounded transition-opacity hover:opacity-70 hidden sm:block"
            style={{ color: "var(--text-muted)" }}
            title="Reset zoom"
          >
            {zoom}%
          </button>

          <button
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="p-2 rounded transition-opacity hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed hidden sm:block"
            style={{ color: "var(--text-muted)" }}
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div
            className="w-px h-5 mx-1 hidden sm:block"
            style={{ background: "var(--border-primary)" }}
          />

          <button
            onClick={isFullscreen ? handleExitFullscreen : handleFullscreen}
            className="p-2 rounded transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Loading fallback for Suspense
function ReaderLoading() {
  return (
    <div
      className="h-screen flex items-center justify-center"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
        />
        <p style={{ color: "var(--text-muted)" }}>Loading reader...</p>
      </div>
    </div>
  );
}

// Main export with Suspense boundary
export default function ReaderPage() {
  return (
    <Suspense fallback={<ReaderLoading />}>
      <ReaderContent />
    </Suspense>
  );
}
