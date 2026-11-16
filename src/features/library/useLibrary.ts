import { useCallback, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type BookmarkRecord, type ReadingPositionRecord } from "@/lib/db/db";

export type LibraryState<T> =
  { status: "loading" } | { status: "success"; data: T } | { status: "error"; error: Error };

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error("Data lokal tidak dapat dibaca.");
}

export function useBookmarksForSurah(surah: number): {
  bookmarked: ReadonlySet<number>;
  createdAt: ReadonlyMap<number, string>;
  status: "loading" | "success" | "error";
} {
  const result = useLiveQuery(async () => {
    try {
      const rows = await db.bookmarks.where("surah").equals(surah).toArray();
      return {
        ok: true as const,
        value: {
          bookmarked: new Set(rows.map((row) => row.ayah)),
          createdAt: new Map(rows.map((row) => [row.ayah, row.createdAt])),
        },
      };
    } catch (error) {
      return { ok: false as const, error: toError(error) };
    }
  }, [surah]);

  if (!result) {
    return { bookmarked: new Set(), createdAt: new Map(), status: "loading" };
  }
  if (!result.ok) {
    return { bookmarked: new Set(), createdAt: new Map(), status: "error" };
  }
  return { ...result.value, status: "success" };
}

export function useBookmarksList(): LibraryState<BookmarkRecord[]> & { retry: () => void } {
  const [attempt, setAttempt] = useState(0);
  const result = useLiveQuery(async () => {
    try {
      const rows = await db.bookmarks.toArray();
      rows.sort((a, b) => {
        const created = b.createdAt.localeCompare(a.createdAt);
        if (created !== 0) return created;
        if (a.surah !== b.surah) return a.surah - b.surah;
        return a.ayah - b.ayah;
      });
      return { ok: true as const, value: rows };
    } catch (error) {
      return { ok: false as const, error: toError(error) };
    }
  }, [attempt]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  if (!result) return { status: "loading", retry };
  if (!result.ok) return { status: "error", error: result.error, retry };
  return { status: "success", data: result.value, retry };
}

export function useLastPosition(): LibraryState<ReadingPositionRecord | null> {
  const result = useLiveQuery(async () => {
    try {
      return { ok: true as const, value: (await db.position.get("last")) ?? null };
    } catch (error) {
      return { ok: false as const, error: toError(error) };
    }
  }, []);

  if (!result) return { status: "loading" };
  if (!result.ok) return { status: "error", error: result.error };
  return { status: "success", data: result.value };
}
