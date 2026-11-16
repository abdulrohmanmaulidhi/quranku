import { SearchX } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/StateView";
import { SearchField } from "@/components/ui/SearchField";
import { Tabs } from "@/components/ui/Tabs";
import { JuzRow } from "@/components/quran/JuzRow";
import { SurahListSkeleton } from "@/components/quran/SurahListSkeleton";
import { SurahRow } from "@/components/quran/SurahRow";
import { filterJuz, filterSurahs } from "@/features/quran/filter";
import { useJuz, useSurahs } from "@/features/quran/useQuranData";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { useOnlineStatus } from "@/lib/useOnlineStatus";
import styles from "./SurahIndexPage.module.css";

const TABS = [
  { value: "surah", label: "Surah" },
  { value: "juz", label: "Juz" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export function SurahIndexPage() {
  useDocumentTitle("Quran");
  const online = useOnlineStatus();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const tab: TabValue = params.get("tab") === "juz" ? "juz" : "surah";

  const surahs = useSurahs();
  const juz = useJuz(surahs.status === "success" ? surahs.data : null);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const clearFilter = () => updateParam("q", "");

  const filteredSurahs = surahs.status === "success" ? filterSurahs(surahs.data, query) : [];
  const filteredJuz =
    juz.status === "success" && surahs.status === "success"
      ? filterJuz(juz.data, surahs.data, query)
      : [];

  const isFiltering = query.trim().length > 0;
  const offlineDescription = "Sambungkan internet sekali, lalu coba lagi.";

  return (
    <PageContainer>
      <header className={styles.header}>
        <h1 className={styles.title}>Quran</h1>
        <p className={styles.subtitle}>114 surah · 30 juz</p>
      </header>

      <SearchField
        value={query}
        onChange={(value) => updateParam("q", value)}
        label="Cari surah atau juz"
        placeholder="Cari surah atau juz"
      />

      <div className={styles.tabs}>
        <Tabs
          id="surah-index"
          label="Pilih daftar"
          items={TABS}
          value={tab}
          onChange={(value) => updateParam("tab", value === "surah" ? "" : value)}
        />
      </div>

      <p className={styles.resultCount} role="status" aria-live="polite">
        {tab === "surah" && surahs.status === "success"
          ? `${filteredSurahs.length} surah ditemukan.`
          : null}
        {tab === "juz" && juz.status === "success" ? `${filteredJuz.length} juz ditemukan.` : null}
      </p>

      {surahs.status === "error" ? (
        <ErrorState
          title="Daftar surah belum dapat dimuat."
          description={!online ? offlineDescription : undefined}
          action={
            <Button variant="primary" onClick={surahs.retry}>
              Coba lagi
            </Button>
          }
        />
      ) : null}

      {tab === "surah" && surahs.status === "loading" ? (
        <div id="surah-index-panel-surah" role="tabpanel" aria-labelledby="surah-index-tab-surah">
          <SurahListSkeleton rows={8} />
        </div>
      ) : null}

      {tab === "surah" && surahs.status === "success" ? (
        <div id="surah-index-panel-surah" role="tabpanel" aria-labelledby="surah-index-tab-surah">
          {filteredSurahs.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Tidak ada hasil"
              description={`Tidak ada surah yang cocok dengan “${query.trim()}”.`}
              action={
                <Button variant="secondary" onClick={clearFilter}>
                  Hapus filter
                </Button>
              }
            />
          ) : (
            <ol className={styles.list}>
              {filteredSurahs.map((surah) => (
                <SurahRow key={surah.n} surah={surah} />
              ))}
            </ol>
          )}
        </div>
      ) : null}

      {tab === "juz" && surahs.status === "success" && juz.status === "error" ? (
        <ErrorState
          title="Daftar juz belum dapat dimuat."
          description={!online ? offlineDescription : undefined}
          action={
            <Button variant="primary" onClick={juz.retry}>
              Coba lagi
            </Button>
          }
        />
      ) : null}

      {tab === "juz" && (surahs.status === "loading" || juz.status === "loading") ? (
        <div id="surah-index-panel-juz" role="tabpanel" aria-labelledby="surah-index-tab-juz">
          <SurahListSkeleton rows={6} />
        </div>
      ) : null}

      {tab === "juz" && surahs.status === "success" && juz.status === "success" ? (
        <div id="surah-index-panel-juz" role="tabpanel" aria-labelledby="surah-index-tab-juz">
          {filteredJuz.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Tidak ada hasil"
              description={`Tidak ada juz yang cocok dengan “${query.trim()}”.`}
              action={
                <Button variant="secondary" onClick={clearFilter}>
                  Hapus filter
                </Button>
              }
            />
          ) : (
            <ol className={styles.list}>
              {filteredJuz.map((entry) => (
                <JuzRow key={entry.juz} juz={entry} surahs={surahs.data} />
              ))}
            </ol>
          )}
        </div>
      ) : null}

      {isFiltering ? <p className={styles.filterHint}>Filter aktif: “{query.trim()}”</p> : null}
    </PageContainer>
  );
}
