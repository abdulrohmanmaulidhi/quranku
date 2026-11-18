import { useCallback, useState } from "react";
import { Bookmark, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button, ButtonLink } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { Snackbar } from "@/components/ui/Snackbar";
import { EmptyState, ErrorState } from "@/components/ui/StateView";
import { useBookmarksList } from "@/features/library/useLibrary";
import { useSurahs, useSurahTranslation } from "@/features/quran/useQuranData";
import { addBookmark, removeBookmark, type BookmarkRecord } from "@/lib/db/db";
import type { Surah } from "@/lib/data/types";
import { formatDate } from "@/lib/format/date";
import { formatReference } from "@/lib/format/reference";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import styles from "./BookmarksPage.module.css";

interface Toast {
  message: string;
  tone: "success" | "error";
  action?: { label: string; onClick: () => void };
}

export function BookmarksPage() {
  useDocumentTitle("Penanda");
  const bookmarks = useBookmarksList();
  const surahs = useSurahs();
  const [toast, setToast] = useState<Toast | null>(null);

  const dismissToast = useCallback(() => setToast(null), []);

  const handleDelete = useCallback(async (row: BookmarkRecord, reference: string) => {
    try {
      await removeBookmark(row.surah, row.ayah);
      setToast({
        message: "Penanda dihapus.",
        tone: "success",
        action: {
          label: "Urungkan",
          onClick: () => {
            setToast(null);
            void addBookmark(row.surah, row.ayah, row.createdAt).catch(() => {
              setToast({ message: "Penanda tidak dapat dipulihkan.", tone: "error" });
            });
          },
        },
      });
    } catch {
      setToast({
        message: `Penanda ${reference} tidak dapat dihapus. Coba lagi.`,
        tone: "error",
      });
    }
  }, []);

  const count = bookmarks.status === "success" ? bookmarks.data.length : null;

  return (
    <PageContainer>
      <header className={styles.header}>
        <h1 className={styles.title}>Penanda</h1>
        {count !== null ? (
          <p className={styles.subtitle}>
            {count > 0 ? `${count} ayat ditandai` : "Belum ada ayat ditandai"}
          </p>
        ) : null}
      </header>

      {bookmarks.status === "loading" ? (
        <div className={styles.loading} aria-hidden="true">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className={styles.loadingRow}>
              <Skeleton width="9rem" height="0.95rem" />
              <Skeleton width="6rem" height="0.7rem" />
            </div>
          ))}
        </div>
      ) : null}

      {bookmarks.status === "error" ? (
        <ErrorState
          title="Penanda belum dapat dibaca."
          description="Penyimpanan lokal tidak dapat diakses. Coba lagi."
          action={<Button onClick={bookmarks.retry}>Coba lagi</Button>}
        />
      ) : null}

      {bookmarks.status === "success" && bookmarks.data.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Belum ada penanda"
          description="Ketuk ikon penanda pada ayat untuk menyimpannya."
          action={
            <ButtonLink to="/surah" variant="secondary">
              Mulai membaca
            </ButtonLink>
          }
        />
      ) : null}

      {bookmarks.status === "success" && bookmarks.data.length > 0 ? (
        <ol className={styles.list}>
          {bookmarks.data.map((row) => {
            const surah = surahs.status === "success" ? surahs.data[row.surah - 1] : undefined;
            const name = surah?.nameLatin ?? `Surah ${row.surah}`;
            const reference = formatReference(name, row.surah, row.ayah);

            return (
              <li key={`${row.surah}:${row.ayah}`} className={styles.item}>
                <Link to={`/surah/${row.surah}/${row.ayah}`} className={styles.link}>
                  <span className={styles.reference}>{reference}</span>
                  {surah ? <BookmarkPreview surah={surah} ayah={row.ayah} /> : null}
                  <span className={styles.meta}>
                    {surah ? `${surah.revelationId} · ` : ""}
                    Ditandai {formatDate(new Date(row.createdAt))}
                  </span>
                </Link>
                <IconButton
                  icon={Trash2}
                  label={`Hapus penanda ${reference}`}
                  className={styles.delete}
                  onClick={() => {
                    void handleDelete(row, reference);
                  }}
                />
              </li>
            );
          })}
        </ol>
      ) : null}

      {toast ? (
        <Snackbar
          message={toast.message}
          tone={toast.tone}
          action={toast.action}
          onDismiss={dismissToast}
        />
      ) : null}
    </PageContainer>
  );
}

function BookmarkPreview({ surah, ayah }: { surah: Surah; ayah: number }) {
  const translation = useSurahTranslation(surah.n, surah.ayahCount);
  const text =
    translation.status === "success"
      ? translation.data.ayahs.find((row) => row.n === ayah)?.text
      : undefined;

  if (!text) return null;

  return (
    <span className={styles.preview} lang="id">
      {text}
    </span>
  );
}
