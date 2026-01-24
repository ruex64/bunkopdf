import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
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

// Book type definition
export interface Book {
  id: string;
  title: string;
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

// Add a new book
export async function addBook(
  book: Omit<Book, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  console.log("[Firebase] Adding new book:", book.title);
  console.log("[Firebase] Book data:", JSON.stringify(book, null, 2));
  
  try {
    const docRef = await addDoc(booksCollection, {
      ...book,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    console.log(`[Firebase] Book added successfully with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    logFirebaseError("addBook", error);
    throw error;
  }
}

// Update a book
export async function updateBook(
  id: string,
  book: Partial<Omit<Book, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  console.log(`[Firebase] Updating book: ${id}`);
  console.log("[Firebase] Update data:", JSON.stringify(book, null, 2));
  
  try {
    const docRef = doc(db, "books", id);
    await updateDoc(docRef, {
      ...book,
      updatedAt: Timestamp.now(),
    });
    
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

export { db };
