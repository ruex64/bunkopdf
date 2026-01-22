"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  BookOpen,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getReadingProgress, setReadingProgress } from "@/lib/readingProgress";

function ReaderContent() {
  const params = useParams();
  const searchParams = useSearchParams();

  const bookId = params.id as string;
  const pdfUrl = searchParams.get("url");
  const bookTitle = searchParams.get("title") || "Document";

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved progress on mount
  useEffect(() => {
    if (bookId) {
      const savedPage = getReadingProgress(bookId);
      setCurrentPage(savedPage);
    }
  }, [bookId]);

  // Save progress with debounce
  const saveProgress = useCallback(
    (page: number) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        if (bookId) {
          setReadingProgress(bookId, page);
        }
      }, 500);
    },
    [bookId]
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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages, handlePageChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 25, 200));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 25, 50));
  const handleResetZoom = () => setZoom(100);

  const handleFullscreen = () => {
    if (iframeRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        iframeRef.current.requestFullscreen();
      }
    }
  };

  if (!pdfUrl) {
    return (
      <div
        className="h-screen flex flex-col items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <BookOpen
          className="w-12 h-12 mb-3"
          style={{ color: "var(--text-muted)", opacity: 0.5 }}
        />
        <p style={{ color: "var(--text-muted)" }}>No PDF URL provided</p>
        <Link
          href="/"
          className="mt-4 px-4 py-2 text-sm rounded transition-opacity hover:opacity-80"
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

  // Build PDF URL with page parameter
  // Using PDF.js viewer or browser's built-in viewer with page parameter
  const viewerUrl = `${pdfUrl}#page=${currentPage}&zoom=${zoom}`;

  return (
    <div
      className="h-screen flex flex-col"
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
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm transition-opacity hover:opacity-70 shrink-0"
            style={{ color: "var(--text-muted)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Library</span>
          </Link>
          <div
            className="w-px h-5"
            style={{ background: "var(--border-primary)" }}
          />
          <h1
            className="text-sm font-medium truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {bookTitle}
          </h1>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
        </div>
      </header>

      {/* PDF Viewer */}
      <div className="flex-1 relative overflow-hidden">
        {loading && (
          <div
            className="absolute inset-0 flex items-center justify-center z-10"
            style={{ background: "var(--bg-primary)" }}
          >
            <p style={{ color: "var(--text-muted)" }}>Loading PDF...</p>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={viewerUrl}
          className="w-full h-full border-0"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError("Failed to load PDF");
          }}
          title={bookTitle}
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
        className="h-14 shrink-0 flex items-center justify-between px-4 border-t"
        style={{
          background: "var(--bg-secondary)",
          borderColor: "var(--border-primary)",
        }}
      >
        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-2 rounded transition-opacity hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: "var(--text-muted)" }}
            title="Previous page (←)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value) || 1;
                handlePageChange(page);
              }}
              min={1}
              max={totalPages || undefined}
              className="w-16 px-2 py-1 text-sm text-center rounded border outline-none focus:border-[var(--accent)]"
              style={{
                background: "var(--bg-primary)",
                borderColor: "var(--border-primary)",
                color: "var(--text-primary)",
              }}
            />
            {totalPages && (
              <span
                className="text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                / {totalPages}
              </span>
            )}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={totalPages !== null && currentPage >= totalPages}
            className="p-2 rounded transition-opacity hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: "var(--text-muted)" }}
            title="Next page (→)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Reading Progress Indicator */}
        <div
          className="hidden sm:block text-xs"
          style={{ color: "var(--text-ghost)" }}
        >
          Progress saved automatically
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="p-2 rounded transition-opacity hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: "var(--text-muted)" }}
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetZoom}
            className="px-2 py-1 text-xs rounded transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
            title="Reset zoom"
          >
            {zoom}%
          </button>

          <button
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="p-2 rounded transition-opacity hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: "var(--text-muted)" }}
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div
            className="w-px h-5 mx-1"
            style={{ background: "var(--border-primary)" }}
          />

          <button
            onClick={handleFullscreen}
            className="p-2 rounded transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
            title="Fullscreen"
          >
            <Maximize className="w-4 h-4" />
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
      <p style={{ color: "var(--text-muted)" }}>Loading reader...</p>
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
