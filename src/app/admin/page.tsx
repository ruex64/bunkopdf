"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, LogOut, BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LoginForm } from "@/components/admin/LoginForm";
import { BookForm } from "@/components/admin/BookForm";
import { BookListItem } from "@/components/admin/BookListItem";
import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal";
import {
  getBooks,
  addBook,
  updateBook,
  deleteBook,
  type Book,
} from "@/lib/firebase";

export default function AdminPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/check");
        const data = await response.json();
        setAuthenticated(data.authenticated);
      } catch {
        setAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  // Fetch books when authenticated
  useEffect(() => {
    if (authenticated) {
      fetchBooks();
    }
  }, [authenticated]);

  async function fetchBooks() {
    setLoading(true);
    try {
      const fetchedBooks = await getBooks();
      setBooks(fetchedBooks);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  async function handleSaveBook(
    bookData: Omit<Book, "id" | "createdAt" | "updatedAt">
  ) {
    if (editingBook) {
      await updateBook(editingBook.id, bookData);
    } else {
      await addBook(bookData);
    }
    setShowBookForm(false);
    setEditingBook(null);
    await fetchBooks();
  }

  async function handleDeleteBook() {
    if (!deletingBook) return;

    setDeleteLoading(true);
    try {
      await deleteBook(deletingBook.id);
      setDeletingBook(null);
      await fetchBooks();
    } catch (error) {
      console.error("Error deleting book:", error);
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleEditBook(book: Book) {
    setEditingBook(book);
    setShowBookForm(true);
  }

  // Loading state
  if (authenticated === null) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <p style={{ color: "var(--text-muted)" }}>Loading...</p>
      </div>
    );
  }

  // Login screen
  if (!authenticated) {
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
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <BookOpen className="w-5 h-5" style={{ color: "var(--accent)" }} />
            <span
              className="text-base font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              KirokuMD Books
            </span>
          </Link>
          <ThemeToggle />
        </header>

        {/* Login Form */}
        <main className="flex-1 flex items-center justify-center p-4">
          <LoginForm onLogin={() => setAuthenticated(true)} />
        </main>
      </div>
    );
  }

  // Admin Dashboard
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
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
            style={{ color: "var(--text-muted)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Library</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="p-2 transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1
                className="text-2xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Admin Dashboard
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                Manage your book collection
              </p>
            </div>
            <button
              onClick={() => {
                setEditingBook(null);
                setShowBookForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded transition-opacity hover:opacity-80"
              style={{
                background: "var(--accent)",
                color: "var(--bg-primary)",
              }}
            >
              <Plus className="w-4 h-4" />
              <span>Add Book</span>
            </button>
          </div>

          {/* Books List */}
          {loading ? (
            <div className="py-12 text-center">
              <p style={{ color: "var(--text-muted)" }}>Loading books...</p>
            </div>
          ) : books.length > 0 ? (
            <div className="space-y-3">
              {books.map((book) => (
                <BookListItem
                  key={book.id}
                  book={book}
                  onEdit={handleEditBook}
                  onDelete={setDeletingBook}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen
                className="w-12 h-12 mb-3"
                style={{ color: "var(--text-muted)", opacity: 0.5 }}
              />
              <p style={{ color: "var(--text-muted)" }}>No books yet</p>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--text-muted)", opacity: 0.7 }}
              >
                Click &quot;Add Book&quot; to add your first book
              </p>
            </div>
          )}

          {/* Stats */}
          {books.length > 0 && (
            <p
              className="text-sm mt-6 text-center"
              style={{ color: "var(--text-ghost)" }}
            >
              {books.length} {books.length === 1 ? "book" : "books"} in
              collection
            </p>
          )}
        </div>
      </main>

      {/* Book Form Modal */}
      {showBookForm && (
        <BookForm
          book={editingBook}
          onSave={handleSaveBook}
          onCancel={() => {
            setShowBookForm(false);
            setEditingBook(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingBook && (
        <DeleteConfirmModal
          title="Delete Book"
          message={`Are you sure you want to delete "${deletingBook.title}"? This action cannot be undone.`}
          onConfirm={handleDeleteBook}
          onCancel={() => setDeletingBook(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
