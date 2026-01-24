import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBookBySlug } from "@/lib/firebase";
import { BookShareClient } from "./BookShareClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book) {
    return {
      title: "Book Not Found | BunkoPDF",
      description: "The book you're looking for doesn't exist.",
    };
  }

  return {
    title: `${book.title} | BunkoPDF`,
    description: book.description || `Read ${book.title} on BunkoPDF`,
    openGraph: {
      title: book.title,
      description: book.description || `Read ${book.title} on BunkoPDF`,
      type: "article",
      images: book.coverUrl
        ? [
            {
              url: book.coverUrl,
              width: 600,
              height: 800,
              alt: book.title,
            },
          ]
        : [],
    },
    twitter: {
      card: book.coverUrl ? "summary_large_image" : "summary",
      title: book.title,
      description: book.description || `Read ${book.title} on BunkoPDF`,
      images: book.coverUrl ? [book.coverUrl] : [],
    },
  };
}

export default async function BookSharePage({ params }: Props) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book) {
    notFound();
  }

  // Serialize the book data for client component
  const serializedBook = {
    ...book,
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
  };

  return <BookShareClient book={serializedBook} />;
}
