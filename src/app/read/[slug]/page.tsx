"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
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
import { Footer } from "@/components/Footer";
import { getBookBySlug, type Book } from "@/lib/firebase";
import { getReadingProgress, setReadingProgress } from "@/lib/readingProgress";

// Declare global pdfjsLib type
declare global {
  interface Window {
    pdfjsLib: {
      GlobalWorkerOptions: { workerSrc: string };
      getDocument: (params: { url: string }) => { promise: Promise<PDFDocumentProxy> };
    };
  }
}

// PDF.js types
type PDFDocumentProxy = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PDFPageProxy>;
};

type PDFPageProxy = {
  getViewport: (params: { scale: number }) => { width: number; height: number };
  render: (params: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => RenderTask;
};

type RenderTask = {
  promise: Promise<void>;
  cancel: () => void;
};

// Load PDF.js from CDN
function loadPdfJs(): Promise<typeof window.pdfjsLib> {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      resolve(window.pdfjsLib);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      resolve(window.pdfjsLib);
    };
    script.onerror = () => reject(new Error("Failed to load PDF.js"));
    document.head.appendChild(script);
  });
}

function ReaderContent() {
  const params = useParams();
  const slug = params.slug as string;

  const [book, setBook] = useState<Book | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [bookLoading, setBookLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBookmark, setShowBookmark] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rendering, setRendering] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch book data
  useEffect(() => {
    async function fetchBook() {
      try {
        const fetchedBook = await getBookBySlug(slug);
        setBook(fetchedBook);
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

  // Load PDF when book is fetched
  useEffect(() => {
    async function loadPdf() {
      if (!book?.pdfUrl) return;

      setLoading(true);
      setError(null);

      try {
        console.log("[Reader] Loading PDF:", book.pdfUrl);
        
        // Load PDF.js from CDN
        const pdfjsLib = await loadPdfJs();
        
        const loadingTask = pdfjsLib.getDocument({
          url: book.pdfUrl,
        });

        const pdf = await loadingTask.promise;
        console.log("[Reader] PDF loaded, pages:", pdf.numPages);
        
        setPdfDoc(pdf as unknown as PDFDocumentProxy);
        setTotalPages(pdf.numPages);

        // Load saved progress AFTER PDF is loaded
        const savedPage = getReadingProgress(book.id);
        console.log("[Reader] Saved progress:", savedPage);
        
        // Ensure saved page is valid
        const validPage = Math.min(Math.max(1, savedPage), pdf.numPages);
        setCurrentPage(validPage);
        
        setLoading(false);
      } catch (err) {
        console.error("[Reader] Failed to load PDF:", err);
        setError("Failed to load PDF. The file might be inaccessible.");
        setLoading(false);
      }
    }

    loadPdf();
  }, [book]);

  // Render current page
  useEffect(() => {
    async function renderPage() {
      if (!pdfDoc || !canvasRef.current || loading) return;

      // Cancel any ongoing render
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      setRendering(true);

      try {
        console.log("[Reader] Rendering page:", currentPage);
        const page = await pdfDoc.getPage(currentPage);
        
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        // Calculate scale based on container width
        const container = containerRef.current;
        const containerWidth = container?.clientWidth || window.innerWidth;
        const containerHeight = container?.clientHeight || window.innerHeight - 120;

        const viewport = page.getViewport({ scale: 1 });
        
        // Fit to width or height, whichever is more constraining
        const scaleX = (containerWidth - 32) / viewport.width;
        const scaleY = (containerHeight - 32) / viewport.height;
        const baseScale = Math.min(scaleX, scaleY, 2); // Max 2x for quality
        
        const finalScale = baseScale * scale;
        const scaledViewport = page.getViewport({ scale: finalScale });

        // Set canvas dimensions
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = scaledViewport.width * pixelRatio;
        canvas.height = scaledViewport.height * pixelRatio;
        canvas.style.width = `${scaledViewport.width}px`;
        canvas.style.height = `${scaledViewport.height}px`;

        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
          canvas: canvas,
        };

        renderTaskRef.current = page.render(renderContext);
        await renderTaskRef.current.promise;
        
        setRendering(false);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "RenderingCancelledException") {
          // Ignore cancelled renders
          return;
        }
        console.error("[Reader] Render error:", err);
        setRendering(false);
      }
    }

    renderPage();
  }, [pdfDoc, currentPage, scale, loading]);

  // Re-render on window resize
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (pdfDoc && canvasRef.current) {
          // Force re-render
          setScale((s) => s);
        }
      }, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [pdfDoc]);

  // Save progress with debounce
  const saveProgress = useCallback(
    (page: number) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        if (book) {
          setReadingProgress(book.id, page);
          console.log("[Reader] Progress saved:", page);
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
      const validPage = Math.min(Math.max(1, newPage), totalPages);
      if (validPage !== currentPage) {
        setCurrentPage(validPage);
        saveProgress(validPage);
      }
    },
    [totalPages, currentPage, saveProgress]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        handlePageChange(currentPage - 1);
      } else if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        handlePageChange(currentPage + 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        handlePageChange(1);
      } else if (e.key === "End") {
        e.preventDefault();
        handlePageChange(totalPages);
      } else if (e.key === "Escape" && isFullscreen) {
        e.preventDefault();
        handleExitFullscreen();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === "-") {
        e.preventDefault();
        handleZoomOut();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages, handlePageChange, isFullscreen]);

  // Touch/swipe navigation for mobile
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;
      
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;
      
      // Only trigger if horizontal swipe is dominant
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          handlePageChange(currentPage + 1);
        } else {
          handlePageChange(currentPage - 1);
        }
      }
    };

    const container = containerRef.current;
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
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

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const handleResetZoom = () => setScale(1);

  const handleFullscreen = async () => {
    const element = document.documentElement;
    try {
      await element.requestFullscreen();
    } catch (err) {
      console.error("Fullscreen error:", err);
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

  return (
    <div
      className="h-screen flex flex-col select-none"
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
        {/* Left: Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <h1
            className="text-sm font-medium truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {book.title}
          </h1>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1">
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
      <div
        ref={containerRef}
        className="flex-1 relative overflow-auto flex items-start justify-center p-4"
        style={{ background: "var(--bg-tertiary)" }}
      >
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
            <p className="mb-4 text-center px-4" style={{ color: "var(--text-muted)" }}>
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

        {/* Canvas for PDF rendering */}
        <canvas
          ref={canvasRef}
          className="shadow-lg rounded"
          style={{
            background: "white",
            opacity: rendering ? 0.7 : 1,
            transition: "opacity 0.1s",
          }}
        />

        {/* Page turn tap zones for mobile */}
        <div
          className="absolute left-0 top-0 bottom-14 w-1/4 cursor-pointer sm:hidden"
          onClick={() => handlePageChange(currentPage - 1)}
        />
        <div
          className="absolute right-0 top-0 bottom-14 w-1/4 cursor-pointer sm:hidden"
          onClick={() => handlePageChange(currentPage + 1)}
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
            title="Previous page (←)"
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
              max={totalPages}
              className="w-12 sm:w-16 px-2 py-1 text-sm text-center rounded border outline-none focus:border-[var(--accent)]"
              style={{
                background: "var(--bg-primary)",
                borderColor: "var(--border-primary)",
                color: "var(--text-primary)",
              }}
            />
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              / {totalPages}
            </span>
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-2 rounded transition-opacity hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: "var(--text-muted)" }}
            title="Next page (→)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Reading Progress Indicator */}
        <div
          className="hidden sm:flex items-center gap-1 text-xs"
          style={{ color: "var(--text-ghost)" }}
        >
          <Bookmark className="w-3 h-3" />
          <span>Auto-saved</span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="p-2 rounded transition-opacity hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed hidden sm:block"
            style={{ color: "var(--text-muted)" }}
            title="Zoom out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetZoom}
            className="px-2 py-1 text-xs rounded transition-opacity hover:opacity-70 hidden sm:block"
            style={{ color: "var(--text-muted)" }}
            title="Reset zoom"
          >
            {Math.round(scale * 100)}%
          </button>

          <button
            onClick={handleZoomIn}
            disabled={scale >= 3}
            className="p-2 rounded transition-opacity hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed hidden sm:block"
            style={{ color: "var(--text-muted)" }}
            title="Zoom in (+)"
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
            title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}
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
