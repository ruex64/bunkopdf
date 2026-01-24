"use client";

import { useEffect, useState, useMemo } from "react";
import { BookOpen, Plus, LogOut, LogIn, Pencil, Trash2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BookCard } from "@/components/BookCard";
import { SearchBar } from "@/components/SearchBar";
import { BookForm } from "@/components/admin/BookForm";
import { LoginForm } from "@/components/admin/LoginForm";
import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal";
import {
  getBooks,
  addBook,
  updateBook,
  deleteBook,
  BOOK_CATEGORIES,
  type Book,
} from "@/lib/firebase";

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Auth state
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);

  // Admin modals
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Check authentication on load
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/check");
        const data = await response.json();
        setIsAdmin(data.authenticated);
      } catch {
        setIsAdmin(false);
      }
    }
    checkAuth();
  }, []);

  const fetchBooks = async () => {
    try {
      const fetchedBooks = await getBooks();
      setBooks(fetchedBooks);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Auth handlers
  const handleLogin = () => {
    setIsAdmin(true);
    setShowLoginForm(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsAdmin(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Book handlers
  const handleSaveBook = async (
    bookData: Omit<Book, "id" | "slug" | "createdAt" | "updatedAt">
  ) => {
    console.log("[Page] Saving book...", bookData.title);
    
    try {
      if (editingBook) {
        console.log("[Page] Updating existing book:", editingBook.id);
        await updateBook(editingBook.id, bookData);
        console.log("[Page] Book updated successfully");
      } else {
        console.log("[Page] Adding new book");
        const newId = await addBook(bookData);
        console.log("[Page] Book added successfully with ID:", newId);
      }
      setShowBookForm(false);
      setEditingBook(null);
      fetchBooks();
    } catch (error) {
      console.error("[Page] Failed to save book:", error);
      // Re-throw to let BookForm handle the error display
      throw error;
    }
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setShowBookForm(true);
  };

  const handleDeleteBook = async () => {
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
  };

  // Fixed categories
  const categories = ["all", ...BOOK_CATEGORIES];

  // Filter books
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        searchQuery === "" ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || book.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [books, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <p style={{ color: "var(--text-muted)" }}>Loading...</p>
      </div>
    );
  }

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
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" style={{ color: "var(--accent)" }} />
          <span
            className="text-base font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            BunkoPDF
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAdmin ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-opacity hover:opacity-80"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-muted)",
              }}
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <button
              onClick={() => setShowLoginForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-opacity hover:opacity-80"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-muted)",
              }}
              title="Admin login"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          {/* Page Title & Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h1
                className="text-xl sm:text-2xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Book Library
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                Browse and read PDF books
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => {
                  setEditingBook(null);
                  setShowBookForm(true);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm rounded transition-opacity hover:opacity-80 w-full sm:w-auto"
                style={{
                  background: "var(--accent)",
                  color: "var(--bg-primary)",
                }}
              >
                <Plus className="w-4 h-4" />
                <span>Add Book</span>
              </button>
            )}
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1">
              <SearchBar onSearch={setSearchQuery} />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded border text-sm outline-none transition-colors focus:border-[var(--accent)] w-full sm:w-auto"
              style={{
                background: "var(--bg-primary)",
                borderColor: "var(--border-primary)",
                color: "var(--text-primary)",
              }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Books Grid */}
          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBooks.map((book) => (
                <div key={book.id} className="relative group">
                  <BookCard book={book} />
                  {/* Admin Controls Overlay */}
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEditBook(book);
                        }}
                        className="p-2 rounded-full shadow-md transition-colors"
                        style={{
                          background: "var(--bg-secondary)",
                          color: "var(--text-primary)",
                        }}
                        title="Edit book"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeletingBook(book);
                        }}
                        className="p-2 rounded-full shadow-md transition-colors hover:bg-red-500 hover:text-white"
                        style={{
                          background: "var(--bg-secondary)",
                          color: "var(--text-primary)",
                        }}
                        title="Delete book"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen
                className="w-12 h-12 mb-3"
                style={{ color: "var(--text-muted)", opacity: 0.5 }}
              />
              <p style={{ color: "var(--text-muted)" }}>
                {searchQuery || selectedCategory !== "all"
                  ? "No books match your search"
                  : "No books available yet"}
              </p>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--text-muted)", opacity: 0.7 }}
              >
                {searchQuery || selectedCategory !== "all"
                  ? "Try a different search term or category"
                  : isAdmin
                  ? "Click 'Add Book' to add your first book"
                  : "Check back later for new additions"}
              </p>
            </div>
          )}

          {/* Results Count */}
          {filteredBooks.length > 0 && (
            <p
              className="text-sm mt-6 text-center"
              style={{ color: "var(--text-ghost)" }}
            >
              Showing {filteredBooks.length} of {books.length} books
            </p>
          )}
        </div>
      </main>

      {/* Login Modal */}
      {showLoginForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowLoginForm(false)}
          />
          <div className="relative">
            <LoginForm onLogin={handleLogin} />
          </div>
        </div>
      )}

      {/* Add/Edit Book Modal */}
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
