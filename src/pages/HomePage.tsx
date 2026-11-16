import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bookmark, BookOpen, ChevronRight } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { InlineError } from "@/components/ui/InlineError";
import { SearchField } from "@/components/ui/SearchField";
import { Skeleton } from "@/components/ui/Skeleton";
import { SurahListSkeleton } from "@/components/quran/SurahListSkeleton";
import { SurahRow } from "@/components/quran/SurahRow";
import { useBookmarksList, useLastPosition } from "@/features/library/useLibrary";
import { useSurahs } from "@/features/quran/useQuranData";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import styles from "./HomePage.module.css";

const SHORTCUT_SURAHS = [1, 2, 18];

export function HomePage() {
  useDocumentTitle("");
  const navigate = useNavigate();
  const surahs = useSurahs();
  const position = useLastPosition();
  const bookmarks = useBookmarksList();
  const [query, setQuery] = useState("");

  const shortcuts =
    surahs.status === "success"
      ? SHORTCUT_SURAHS.map((number) => surahs.data[number - 1]).filter(
          (surah) => surah !== undefined,
        )
      : [];

  const resume =
    position.status === "success" && position.data && surahs.status === "success"
      ? surahs.data[position.data.surah - 1]
      : undefined;
  const resumeAyah = position.status === "success" ? position.data?.ayah : undefined;

  const bookmarkMeta =
    bookmarks.status === "error"
      ? "Penanda belum dapat dibaca"
      : bookmarks.status === "success" && bookmarks.data.length > 0
        ? `${bookmarks.data.length} penanda tersimpan`
        : "Belum ada penanda tersimpan";

  const handleSearch = () => {
    const value = query.trim();
    navigate(value ? `/cari?mode=surah&q=${encodeURIComponent(value)}` : "/cari?mode=surah");
  };

  return (
    <PageContainer>
      <header className={styles.header}>
        <p className={styles.greeting}>Assalamu&apos;alaikum</p>
        <h1 className={styles.title}>Quranku</h1>
      </header>

      <SearchField
        value={query}
        onChange={setQuery}
        label="Cari surah"
        placeholder="Cari surah"
        onSubmit={handleSearch}
      />

      {position.status === "loading" ? (
        <div className={styles.startSkeleton} aria-hidden="true">
          <Skeleton width="100%" height="3rem" radius="full" />
        </div>
      ) : resume && resumeAyah ? (
        <Link to={`/surah/${resume.n}/${resumeAyah}`} className={styles.resume}>
          <span className={styles.resumeIcon}>
            <Icon icon={BookOpen} size={20} />
          </span>
          <span className={styles.resumeBody}>
            <span className={styles.resumeLabel}>Lanjutkan membaca</span>
            <span className={styles.resumeTitle}>{resume.nameLatin}</span>
            <span className={styles.resumeMeta}>
              Ayat {resumeAyah} dari {resume.ayahCount}
            </span>
          </span>
          <span className={styles.resumeChevron}>
            <Icon icon={ChevronRight} size={18} />
          </span>
        </Link>
      ) : (
        <ButtonLink to="/surah" size="l" fullWidth className={styles.start}>
          Mulai membaca
        </ButtonLink>
      )}

      <section className={styles.section} aria-labelledby="explore-heading">
        <div className={styles.sectionHeader}>
          <h2 id="explore-heading" className={styles.sectionTitle}>
            Jelajahi surah
          </h2>
          <Link to="/surah" className={styles.textLink}>
            Lihat semua
          </Link>
        </div>

        {surahs.status === "loading" ? <SurahListSkeleton rows={3} /> : null}

        {surahs.status === "error" ? (
          <InlineError
            message="Daftar surah belum dapat dimuat."
            action={
              <Button variant="ghost" onClick={surahs.retry}>
                Coba lagi
              </Button>
            }
          />
        ) : null}

        {surahs.status === "success" ? (
          <ol className={styles.list}>
            {shortcuts.map((surah) => (
              <SurahRow key={surah.n} surah={surah} />
            ))}
          </ol>
        ) : null}
      </section>

      <Link to="/penanda" className={styles.shortcut}>
        <span className={styles.shortcutIcon}>
          <Icon icon={Bookmark} size={20} />
        </span>
        <span className={styles.shortcutBody}>
          <span className={styles.shortcutTitle}>Penanda</span>
          <span className={styles.shortcutMeta}>{bookmarkMeta}</span>
        </span>
        <span className={styles.shortcutChevron}>
          <Icon icon={ChevronRight} size={18} />
        </span>
      </Link>
    </PageContainer>
  );
}
