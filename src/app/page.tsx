"use client";

import { useEffect, useState, useMemo } from "react";
import { BookOpen } from "lucide-react";
import { Header } from "@/components/Header";
import { BookCard } from "@/components/BookCard";
import { SearchBar } from "@/components/SearchBar";
import { getBooks, type Book } from "@/lib/firebase";

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    async function fetchBooks() {
      try {
        const fetchedBooks = await getBooks();
        setBooks(fetchedBooks);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(books.map((book) => book.category).filter(Boolean));
    return ["all", ...Array.from(cats)];
  }, [books]);

  // Filter books
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        searchQuery === "" ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      <Header />

      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1
              className="text-2xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Book Library
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Browse and read PDF books shared in the collection
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1">
              <SearchBar onSearch={setSearchQuery} />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded border text-sm outline-none transition-colors focus:border-[var(--accent)]"
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
                <BookCard key={book.id} book={book} />
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
    </div>
  );
}
