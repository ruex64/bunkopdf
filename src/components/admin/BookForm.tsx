"use client";

import { useState, useRef } from "react";
import { X, Save, Upload, Image as ImageIcon } from "lucide-react";
import { BOOK_CATEGORIES, type Book, type BookCategory } from "@/lib/firebase";

interface BookFormProps {
  book?: Book | null;
  onSave: (book: Omit<Book, "id" | "slug" | "createdAt" | "updatedAt">) => Promise<void>;
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");
      formData.append("folder", "bunkopdf/covers");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setFormData((prev) => ({ ...prev, coverUrl: data.secure_url }));
    } catch (err) {
      setError("Failed to upload image. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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
                Cover Image (optional)
              </label>
              
              {/* Upload Button */}
              <div className="flex gap-2 mb-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="coverImageUpload"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded border transition-colors hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "var(--bg-tertiary)",
                    borderColor: "var(--border-primary)",
                    color: "var(--text-primary)",
                  }}
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload to Cloudinary</span>
                    </>
                  )}
                </button>
              </div>

              {/* Cover Preview */}
              {formData.coverUrl && (
                <div className="mb-2 relative inline-block">
                  <img
                    src={formData.coverUrl}
                    alt="Cover preview"
                    className="h-24 w-auto rounded border object-cover"
                    style={{ borderColor: "var(--border-primary)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, coverUrl: "" }))}
                    className="absolute -top-2 -right-2 p-1 rounded-full"
                    style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Manual URL Input */}
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 h-px" style={{ background: "var(--border-primary)" }} />
                <span className="text-xs" style={{ color: "var(--text-ghost)" }}>or paste URL</span>
                <div className="flex-1 h-px" style={{ background: "var(--border-primary)" }} />
              </div>
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
