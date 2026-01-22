// Reading progress utility - stores last read page in localStorage

const STORAGE_KEY = "kirokumd-reading-progress";

interface ReadingProgress {
  [bookId: string]: {
    page: number;
    lastRead: string;
  };
}

export function getReadingProgress(bookId: string): number {
  if (typeof window === "undefined") return 1;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return 1;

    const progress: ReadingProgress = JSON.parse(stored);
    return progress[bookId]?.page || 1;
  } catch {
    return 1;
  }
}

export function setReadingProgress(bookId: string, page: number): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const progress: ReadingProgress = stored ? JSON.parse(stored) : {};

    progress[bookId] = {
      page,
      lastRead: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Error saving reading progress:", error);
  }
}

export function getAllReadingProgress(): ReadingProgress {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function clearReadingProgress(bookId: string): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const progress: ReadingProgress = JSON.parse(stored);
    delete progress[bookId];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Error clearing reading progress:", error);
  }
}
