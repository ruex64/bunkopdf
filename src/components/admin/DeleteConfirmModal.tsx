"use client";

import { X, AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function DeleteConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
}: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm rounded-lg shadow-lg"
        style={{ background: "var(--bg-secondary)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: "var(--border-primary)" }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2
              className="text-lg font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1 transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {message}
          </p>
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-2 p-4 border-t"
          style={{ borderColor: "var(--border-primary)" }}
        >
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm rounded transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm rounded transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed bg-red-500 text-white"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
