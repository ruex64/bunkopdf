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
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

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
  const q = query(booksCollection, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  
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
}

// Add a new book
export async function addBook(
  book: Omit<Book, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const docRef = await addDoc(booksCollection, {
    ...book,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

// Update a book
export async function updateBook(
  id: string,
  book: Partial<Omit<Book, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  const docRef = doc(db, "books", id);
  await updateDoc(docRef, {
    ...book,
    updatedAt: Timestamp.now(),
  });
}

// Delete a book
export async function deleteBook(id: string): Promise<void> {
  const docRef = doc(db, "books", id);
  await deleteDoc(docRef);
}

export { db };
