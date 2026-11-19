import { Search, SearchX } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/StateView";
import { SearchField } from "@/components/ui/SearchField";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SearchResultRow } from "@/components/quran/SearchResultRow";
import { SearchResultsSkeleton } from "@/components/quran/SearchResultsSkeleton";
import { SurahListSkeleton } from "@/components/quran/SurahListSkeleton";
import { SurahRow } from "@/components/quran/SurahRow";
import { TranslationResultRow } from "@/components/quran/TranslationResultRow";
import { filterSurahs } from "@/features/quran/filter";
import {
  MAX_SEARCH_QUERY_LENGTH,
  MIN_SEARCH_QUERY_LENGTH,
  MIN_TRANSLATION_QUERY_LENGTH,
  SEARCH_RESULT_LIMIT,
  searchAyahs,
} from "@/features/quran/search";
import { useSearchIndex, useTranslationSearchIndex } from "@/features/quran/useSearchIndex";
import { useSurahs } from "@/features/quran/useQuranData";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { useOnlineStatus } from "@/lib/useOnlineStatus";
import styles from "./SearchPage.module.css";

const MODES = [
  { value: "surah", label: "Surah" },
  { value: "arab", label: "Arab" },
  { value: "terjemahan", label: "Terjemahan" },
] as const;

type SearchMode = (typeof MODES)[number]["value"];

const OFFLINE_SURAH_DESCRIPTION = "Sambungkan internet sekali, lalu coba lagi.";
const OFFLINE_INDEX_DESCRIPTION =
  "Indeks pencarian belum tersimpan di perangkat ini. Sambungkan internet sekali untuk menyimpannya.";

function parseMode(value: string | null): SearchMode {
  return value === "arab" || value === "terjemahan" ? value : "surah";
}

export function SearchPage() {
  useDocumentTitle("Cari");
  const online = useOnlineStatus();
  const [params, setParams] = useSearchParams();

  const rawQuery = params.get("q") ?? "";
  const mode = parseMode(params.get("mode"));
  const isAyahMode = mode !== "surah";
  const minLength = mode === "terjemahan" ? MIN_TRANSLATION_QUERY_LENGTH : MIN_SEARCH_QUERY_LENGTH;
  const debouncedQuery = useDebouncedValue(rawQuery, 250);
  const query = debouncedQuery.trim();
  const hasQuery = query.length > 0;

  const surahs = useSurahs();
  const arabIndex = useSearchIndex(mode === "arab" && query.length >= MIN_SEARCH_QUERY_LENGTH);
  const translationIndex = useTranslationSearchIndex(
    mode === "terjemahan" && query.length >= MIN_TRANSLATION_QUERY_LENGTH,
  );
  const index = mode === "terjemahan" ? translationIndex : arabIndex;
  const indexData = index.status === "success" ? index.data : null;

  const surahResults =
    mode === "surah" && hasQuery && surahs.status === "success"
      ? filterSurahs(surahs.data, query)
      : [];

  const ayahResults =
    indexData && query && isAyahMode
      ? searchAyahs(indexData.entries, query, SEARCH_RESULT_LIMIT, {
          stem: mode === "terjemahan",
        })
      : [];

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const clearQuery = () => updateParam("q", "");

  const handleModeChange = (value: string) => {
    updateParam("mode", value === "surah" ? "" : value);
  };

  let announcement: string | null = null;
  if (mode === "surah" && hasQuery && surahs.status === "success") {
    announcement = `${surahResults.length} surah ditemukan.`;
  } else if (isAyahMode && query.length >= minLength) {
    if (index.status === "loading" || index.status === "idle") {
      announcement = mode === "terjemahan" ? "Mencari terjemahan…" : "Mencari ayat…";
    } else if (index.status === "success") {
      announcement =
        ayahResults.length === 0
          ? mode === "terjemahan"
            ? "Tidak ada terjemahan yang cocok."
            : "Tidak ada ayat yang cocok."
          : ayahResults.length >= SEARCH_RESULT_LIMIT
            ? `Menampilkan ${SEARCH_RESULT_LIMIT} hasil teratas.`
            : `${ayahResults.length} ayat ditemukan.`;
    }
  }

  const isEmptyTitle = mode === "surah" ? "Mulai mencari surah" : "Mulai mencari ayat";
  const isEmptyDescription =
    mode === "surah"
      ? "Ketik nama atau nomor surah untuk menemukannya."
      : mode === "terjemahan"
        ? "Ketik minimal tiga huruf untuk mencari terjemahan ayat."
        : "Ketik minimal dua huruf Arab tanpa harakat untuk mencari ayat.";

  return (
    <PageContainer>
      <header className={styles.header}>
        <h1 className={styles.title}>Cari</h1>
        <p className={styles.subtitle}>
          {mode === "surah"
            ? "Cari surah berdasarkan nama atau nomor."
            : mode === "terjemahan"
              ? "Cari ayat berdasarkan terjemahan Indonesia."
              : "Cari ayat berdasarkan teks Arab tanpa harakat."}
        </p>
      </header>

      <SearchField
        value={rawQuery}
        onChange={(value) => updateParam("q", value)}
        label={
          mode === "surah"
            ? "Cari surah"
            : mode === "terjemahan"
              ? "Cari terjemahan ayat"
              : "Cari ayat dalam bahasa Arab"
        }
        placeholder={
          mode === "surah" ? "Cari surah" : mode === "terjemahan" ? "Cari terjemahan" : "Cari ayat"
        }
        autoFocus
        maxLength={MAX_SEARCH_QUERY_LENGTH}
      />

      <div className={styles.modes}>
        <SegmentedControl
          label="Mode pencarian"
          value={mode}
          options={MODES}
          onChange={handleModeChange}
        />
      </div>

      {mode === "arab" ? <p className={styles.hint}>Pencarian Arab mengabaikan harakat.</p> : null}
      {mode === "terjemahan" ? (
        <p className={styles.hint}>
          Pencarian terjemahan mengabaikan huruf besar/kecil, diakritik, dan imbuhan umum.
        </p>
      ) : null}

      <p className={styles.resultCount} role="status" aria-live="polite">
        {announcement}
      </p>

      {!hasQuery ? (
        <EmptyState
          icon={Search}
          title={isEmptyTitle}
          description={isEmptyDescription}
          action={
            <ButtonLink to="/surah" variant="secondary">
              Jelajahi semua surah
            </ButtonLink>
          }
        />
      ) : null}

      {mode === "surah" && hasQuery && surahs.status === "loading" ? (
        <SurahListSkeleton rows={5} />
      ) : null}

      {mode === "surah" && hasQuery && surahs.status === "error" ? (
        <ErrorState
          title="Daftar surah belum dapat dimuat."
          description={!online ? OFFLINE_SURAH_DESCRIPTION : undefined}
          action={
            <Button onClick={surahs.retry} variant="primary">
              Coba lagi
            </Button>
          }
        />
      ) : null}

      {mode === "surah" && hasQuery && surahs.status === "success" && surahResults.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Tidak ada hasil"
          description={`Tidak ada hasil untuk “${query}”. Coba kata lain.`}
          action={
            <Button variant="secondary" onClick={clearQuery}>
              Hapus pencarian
            </Button>
          }
        />
      ) : null}

      {mode === "surah" && hasQuery && surahs.status === "success" && surahResults.length > 0 ? (
        <ol className={styles.list}>
          {surahResults.map((surah) => (
            <SurahRow key={surah.n} surah={surah} />
          ))}
        </ol>
      ) : null}

      {isAyahMode && hasQuery && query.length < minLength ? (
        <p className={styles.minimum}>
          Ketik minimal {mode === "terjemahan" ? "tiga" : "dua"} huruf untuk mulai mencari ayat.
        </p>
      ) : null}

      {isAyahMode &&
      query.length >= minLength &&
      (index.status === "loading" || index.status === "idle" || surahs.status === "loading") ? (
        <SearchResultsSkeleton rows={4} />
      ) : null}

      {isAyahMode &&
      query.length >= minLength &&
      (index.status === "error" || surahs.status === "error") ? (
        <ErrorState
          title="Pencarian belum siap."
          description={
            !online
              ? OFFLINE_INDEX_DESCRIPTION
              : index.status === "error"
                ? "Coba lagi sebentar lagi."
                : OFFLINE_SURAH_DESCRIPTION
          }
          action={
            <Button
              variant="primary"
              onClick={() => {
                if (index.status === "error") index.retry();
                if (surahs.status === "error") surahs.retry();
              }}
            >
              Coba lagi
            </Button>
          }
        />
      ) : null}

      {isAyahMode &&
      query.length >= minLength &&
      index.status === "success" &&
      surahs.status === "success" &&
      ayahResults.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Tidak ada hasil"
          description={`Tidak ada hasil untuk “${query}”. Coba kata lain.`}
          action={
            <Button variant="secondary" onClick={clearQuery}>
              Hapus pencarian
            </Button>
          }
        />
      ) : null}

      {isAyahMode &&
      query.length >= minLength &&
      index.status === "success" &&
      surahs.status === "success" &&
      ayahResults.length > 0 ? (
        <>
          <ol className={styles.list}>
            {ayahResults.map((result) => {
              const surah = surahs.data[result.surah - 1];
              if (!surah) return null;
              const key = `${result.surah}:${result.ayah}`;
              return mode === "terjemahan" ? (
                <TranslationResultRow key={key} result={result} surah={surah} query={query} />
              ) : (
                <SearchResultRow key={key} result={result} surah={surah} query={query} />
              );
            })}
          </ol>
          {ayahResults.length >= SEARCH_RESULT_LIMIT ? (
            <p className={styles.note}>
              Menampilkan {SEARCH_RESULT_LIMIT} hasil teratas. Persempit kata kunci untuk hasil
              lain.
            </p>
          ) : null}
        </>
      ) : null}

      <p className={styles.note}>
        Pencarian Arab mengabaikan harakat. Pencarian terjemahan mencakup teks terjemahan, bukan
        catatan kaki.
      </p>
    </PageContainer>
  );
}
