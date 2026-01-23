"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";
import { BOOK_CATEGORIES, type Book, type BookCategory } from "@/lib/firebase";

interface BookFormProps {
  book?: Book | null;
  onSave: (book: Omit<Book, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onCancel: () => void;
}

export function BookForm({ book, onSave, onCancel }: BookFormProps) {
  const [formData, setFormData] = useState({
    title: book?.title || "",
    description: book?.description || "",
    pdfUrl: book?.pdfUrl || "",
    coverUrl: book?.coverUrl || "",
    category: (book?.category || "Scripts") as BookCategory,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (!formData.title.trim() || !formData.pdfUrl.trim()) {
      setError("Title and PDF URL are required");
      return;
    }

    // Validate URL format
    try {
      new URL(formData.pdfUrl);
      if (formData.coverUrl) {
        new URL(formData.coverUrl);
      }
    } catch {
      setError("Please enter valid URLs");
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
    } catch (err) {
      setError("Failed to save book. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        className="relative w-full sm:max-w-lg rounded-t-lg sm:rounded-lg shadow-lg max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        style={{ background: "var(--bg-secondary)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b shrink-0"
          style={{ borderColor: "var(--border-primary)" }}
        >
          <h2
            className="text-lg font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {book ? "Edit Book" : "Add New Book"}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto">
          <div className="p-4 space-y-4">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Title <span style={{ color: "var(--accent)" }}>*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter book title"
                className="w-full px-3 py-2 rounded border text-sm outline-none transition-colors focus:border-[var(--accent)]"
                style={{
                  background: "var(--bg-primary)",
                  borderColor: "var(--border-primary)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Category <span style={{ color: "var(--accent)" }}>*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded border text-sm outline-none transition-colors focus:border-[var(--accent)]"
                style={{
                  background: "var(--bg-primary)",
                  borderColor: "var(--border-primary)",
                  color: "var(--text-primary)",
                }}
              >
                {BOOK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* PDF URL */}
            <div>
              <label
                htmlFor="pdfUrl"
                className="block text-sm mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                PDF URL (GitHub) <span style={{ color: "var(--accent)" }}>*</span>
              </label>
              <input
                id="pdfUrl"
                name="pdfUrl"
                type="url"
                value={formData.pdfUrl}
                onChange={handleChange}
                required
                placeholder="https://raw.githubusercontent.com/..."
                className="w-full px-3 py-2 rounded border text-sm outline-none transition-colors focus:border-[var(--accent)]"
                style={{
                  background: "var(--bg-primary)",
                  borderColor: "var(--border-primary)",
                  color: "var(--text-primary)",
                }}
              />
              <p
                className="text-xs mt-1"
                style={{ color: "var(--text-ghost)" }}
              >
                Use the raw GitHub URL for the PDF file
              </p>
            </div>

            {/* Cover URL */}
            <div>
              <label
                htmlFor="coverUrl"
                className="block text-sm mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Cover Image URL (optional)
              </label>
              <input
                id="coverUrl"
                name="coverUrl"
                type="url"
                value={formData.coverUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded border text-sm outline-none transition-colors focus:border-[var(--accent)]"
                style={{
                  background: "var(--bg-primary)",
                  borderColor: "var(--border-primary)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief description of the book"
                className="w-full px-3 py-2 rounded border text-sm outline-none transition-colors focus:border-[var(--accent)] resize-none"
                style={{
                  background: "var(--bg-primary)",
                  borderColor: "var(--border-primary)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {/* Footer */}
          <div
            className="flex justify-end gap-2 p-4 border-t shrink-0"
            style={{ borderColor: "var(--border-primary)" }}
          >
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm rounded transition-opacity hover:opacity-80"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-primary)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "var(--accent)",
                color: "var(--bg-primary)",
              }}
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{book ? "Update" : "Add"} Book</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
