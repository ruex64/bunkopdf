import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  Timestamp,
  FirestoreError,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Log Firebase config (without sensitive data) for debugging
console.log("[Firebase] Initializing with project:", firebaseConfig.projectId);

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

console.log("[Firebase] Firestore initialized successfully");

// Helper function to log errors with details
function logFirebaseError(operation: string, error: unknown): void {
  console.error(`[Firebase] ${operation} failed:`);
  
  if (error instanceof FirestoreError) {
    console.error(`  - Code: ${error.code}`);
    console.error(`  - Message: ${error.message}`);
    
    // Provide helpful hints based on error code
    switch (error.code) {
      case "permission-denied":
        console.error("  - Hint: Check your Firestore security rules");
        break;
      case "unavailable":
        console.error("  - Hint: Network issue or Firestore is down");
        break;
      case "unauthenticated":
        console.error("  - Hint: Authentication required for this operation");
        break;
      case "not-found":
        console.error("  - Hint: Document or collection doesn't exist");
        break;
      case "already-exists":
        console.error("  - Hint: Document already exists");
        break;
      case "resource-exhausted":
        console.error("  - Hint: Quota exceeded, check Firebase console");
        break;
      case "failed-precondition":
        console.error("  - Hint: Index might be required, check console for link");
        break;
    }
  } else if (error instanceof Error) {
    console.error(`  - Error: ${error.message}`);
    console.error(`  - Stack: ${error.stack}`);
    
    // Check for common non-Firestore errors
    if (error.message.includes("ERR_BLOCKED_BY_CLIENT")) {
      console.error("  - Hint: Request blocked by ad blocker or browser extension");
    } else if (error.message.includes("network")) {
      console.error("  - Hint: Network connectivity issue");
    }
  } else {
    console.error(`  - Unknown error:`, error);
  }
}

// Category options
export const BOOK_CATEGORIES = ["Scripts", "Short Stories", "Novels", "Poems"] as const;
export type BookCategory = typeof BOOK_CATEGORIES[number];

// Generate URL-friendly slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Book type definition
export interface Book {
  id: string;
  title: string;
  slug: string;
  description: string;
  pdfUrl: string;
  coverUrl?: string;
  category: BookCategory;
  createdAt: Date;
  updatedAt: Date;
}

// Books collection reference
const booksCollection = collection(db, "books");

// Get all books
export async function getBooks(): Promise<Book[]> {
  console.log("[Firebase] Fetching all books...");
  
  try {
    const q = query(booksCollection, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    console.log(`[Firebase] Successfully fetched ${snapshot.docs.length} books`);
    
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        slug: data.slug || generateSlug(data.title),
        description: data.description,
        pdfUrl: data.pdfUrl,
        coverUrl: data.coverUrl || "",
        category: data.category,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });
  } catch (error) {
    logFirebaseError("getBooks", error);
    throw error;
  }
}

// Get a book by slug
export async function getBookBySlug(slug: string): Promise<Book | null> {
  console.log(`[Firebase] Fetching book by slug: ${slug}`);
  
  try {
    const q = query(booksCollection, where("slug", "==", slug));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log(`[Firebase] No book found with slug: ${slug}`);
      return null;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    console.log(`[Firebase] Found book: ${data.title}`);
    
    return {
      id: doc.id,
      title: data.title,
      slug: data.slug,
      description: data.description,
      pdfUrl: data.pdfUrl,
      coverUrl: data.coverUrl || "",
      category: data.category,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    logFirebaseError("getBookBySlug", error);
    throw error;
  }
}

// Get a book by ID
export async function getBookById(id: string): Promise<Book | null> {
  console.log(`[Firebase] Fetching book by ID: ${id}`);
  
  try {
    const docRef = doc(db, "books", id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.log(`[Firebase] No book found with ID: ${id}`);
      return null;
    }
    
    const data = docSnap.data();
    
    console.log(`[Firebase] Found book: ${data.title}`);
    
    return {
      id: docSnap.id,
      title: data.title,
      slug: data.slug || generateSlug(data.title),
      description: data.description,
      pdfUrl: data.pdfUrl,
      coverUrl: data.coverUrl || "",
      category: data.category,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    logFirebaseError("getBookById", error);
    throw error;
  }
}

// Add a new book
export async function addBook(
  book: Omit<Book, "id" | "slug" | "createdAt" | "updatedAt">
): Promise<string> {
  console.log("[Firebase] Adding new book:", book.title);
  console.log("[Firebase] Book data:", JSON.stringify(book, null, 2));
  
  try {
    const slug = generateSlug(book.title);
    
    // Check if slug already exists
    const existingBook = await getBookBySlug(slug);
    const finalSlug = existingBook ? `${slug}-${Date.now()}` : slug;
    
    const docRef = await addDoc(booksCollection, {
      ...book,
      slug: finalSlug,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    console.log(`[Firebase] Book added successfully with ID: ${docRef.id}, slug: ${finalSlug}`);
    return docRef.id;
  } catch (error) {
    logFirebaseError("addBook", error);
    throw error;
  }
}

// Update a book
export async function updateBook(
  id: string,
  book: Partial<Omit<Book, "id" | "slug" | "createdAt" | "updatedAt">>
): Promise<void> {
  console.log(`[Firebase] Updating book: ${id}`);
  console.log("[Firebase] Update data:", JSON.stringify(book, null, 2));
  
  try {
    const docRef = doc(db, "books", id);
    
    // If title is being updated, also update the slug
    const updateData: Record<string, unknown> = {
      ...book,
      updatedAt: Timestamp.now(),
    };
    
    if (book.title) {
      updateData.slug = generateSlug(book.title);
    }
    
    await updateDoc(docRef, updateData);
    
    console.log(`[Firebase] Book ${id} updated successfully`);
  } catch (error) {
    logFirebaseError("updateBook", error);
    throw error;
  }
}

// Delete a book
export async function deleteBook(id: string): Promise<void> {
  console.log(`[Firebase] Deleting book: ${id}`);
  
  try {
    const docRef = doc(db, "books", id);
    await deleteDoc(docRef);
    
    console.log(`[Firebase] Book ${id} deleted successfully`);
  } catch (error) {
    logFirebaseError("deleteBook", error);
    throw error;
  }
}

// Review type definition
export interface Review {
  id: string;
  bookId: string;
  name: string;
  comment: string;
  rating: number;
  createdAt: Date;
}

// Reviews collection reference
const reviewsCollection = collection(db, "reviews");

// Add a new review
export async function addReview(
  review: Omit<Review, "id" | "createdAt">
): Promise<string> {
  console.log("[Firebase] Adding new review for book:", review.bookId);
  
  try {
    const docRef = await addDoc(reviewsCollection, {
      ...review,
      createdAt: Timestamp.now(),
    });
    
    console.log(`[Firebase] Review added successfully with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    logFirebaseError("addReview", error);
    throw error;
  }
}

// Get reviews for a specific book
export async function getReviewsByBookId(bookId: string): Promise<Review[]> {
  console.log(`[Firebase] Fetching reviews for book: ${bookId}`);
  
  try {
    const q = query(
      reviewsCollection,
      where("bookId", "==", bookId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    
    console.log(`[Firebase] Successfully fetched ${snapshot.docs.length} reviews`);
    
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        bookId: data.bookId,
        name: data.name,
        comment: data.comment,
        rating: data.rating,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });
  } catch (error) {
    logFirebaseError("getReviewsByBookId", error);
    throw error;
  }
}

export { db };
