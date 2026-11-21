import { useCallback, useEffect, useRef, useState } from "react";
import { CornerDownRight, SlidersHorizontal } from "lucide-react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { BackToTop } from "@/components/layout/BackToTop";
import { TopBar } from "@/components/layout/TopBar";
import { Button, ButtonLink } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { Snackbar } from "@/components/ui/Snackbar";
import { ErrorState } from "@/components/ui/StateView";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { AyahCard } from "@/components/quran/AyahCard";
import { AyahNav } from "@/components/quran/AyahNav";
import { AttributionFooter } from "@/components/quran/AttributionFooter";
import { JumpToDialog } from "@/components/quran/JumpToDialog";
import { ReadingSettings } from "@/components/quran/ReadingSettings";
import { SurahHeader } from "@/components/quran/SurahHeader";
import type { ArabicSize } from "@/components/quran/ArabicText";
import type { TranslationSize } from "@/features/library/useTranslationSize";
import { useArabicSize } from "@/features/library/useArabicSize";
import { useTranslationSize } from "@/features/library/useTranslationSize";
import { useTranslationVisible } from "@/features/library/useTranslationVisible";
import { useBookmarksForSurah } from "@/features/library/useLibrary";
import {
  useSurahs,
  useBasmalah,
  useSurahText,
  useSurahTranslation,
  type AsyncResource,
} from "@/features/quran/useQuranData";
import { addBookmark, saveReadingPosition, setBookmark } from "@/lib/db/db";
import { formatReference } from "@/lib/format/reference";
import type { Surah, SurahText, SurahTranslation } from "@/lib/data/types";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { useOnlineStatus } from "@/lib/useOnlineStatus";
import styles from "./ReaderPage.module.css";

interface RouteState {
  from?: unknown;
  showTranslation?: unknown;
}

interface Toast {
  message: string;
  tone: "success" | "error";
  action?: { label: string; onClick: () => void };
}

function parseSurahNumber(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const number = Number(value);
  return Number.isInteger(number) ? number : null;
}

function parseAyahNumber(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const number = Number(value);
  return Number.isInteger(number) ? number : null;
}

function useBackNavigation(): { onBack?: () => void; backTo?: string } {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as RouteState | null;
  const canGoBack = Boolean(state && typeof state.from === "string");

  if (canGoBack) {
    return { onBack: () => navigate(-1) };
  }
  return { backTo: "/surah" };
}

export function ReaderPage() {
  const params = useParams<{ surah: string; ayah?: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const surahs = useSurahs();
  const back = useBackNavigation();
  const arabicSize = useArabicSize();
  const translationSize = useTranslationSize();
  const translationVisible = useTranslationVisible();
  // Hasil pencarian terjemahan membuka ayat dengan terjemahan tampil untuk
  // kunjungan ini saja; pilihan tersimpan tidak diubah diam-diam.
  const [forceTranslation, setForceTranslation] = useState(
    () => (location.state as RouteState | null)?.showTranslation === true,
  );
  const showTranslation = translationVisible.visible || forceTranslation;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [jumpOpen, setJumpOpen] = useState(false);

  const surahNumber = parseSurahNumber(params.surah);
  const rawAyah = params.ayah ?? searchParams.get("ayah");
  const parsedAyah = parseAyahNumber(rawAyah);

  const surah =
    surahNumber && surahs.status === "success" ? surahs.data[surahNumber - 1] : undefined;

  const targetAyah =
    surah && parsedAyah && parsedAyah >= 1 && parsedAyah <= surah.ayahCount ? parsedAyah : null;
  const invalidAyahRequest = Boolean(surah) && Boolean(rawAyah) && targetAyah === null;
  const invalidAyahLabel = invalidAyahRequest ? rawAyah : null;

  const text = useSurahText(surahNumber ?? 0, surah?.ayahCount ?? 0, Boolean(surah));
  const translation = useSurahTranslation(
    surahNumber ?? 0,
    surah?.ayahCount ?? 0,
    Boolean(surah) && showTranslation,
  );

  useDocumentTitle(
    surah ? `${surah.nameLatin}${targetAyah ? ` ayat ${targetAyah}` : ""}` : "Baca Quran",
  );

  const settingsAvailable = Boolean(surah) && text.status === "success";
  const sampleText = text.status === "success" ? (text.data.ayahs[0]?.text ?? "") : "";

  const topBar = (
    <TopBar
      title={surah?.nameLatin ?? "Baca Quran"}
      {...back}
      readingProgress
      actions={
        settingsAvailable ? (
          <>
            <IconButton
              icon={CornerDownRight}
              label="Lompat ke"
              aria-expanded={jumpOpen}
              onClick={() => setJumpOpen(true)}
            />
            <IconButton
              icon={SlidersHorizontal}
              label="Pengaturan baca"
              aria-expanded={settingsOpen}
              onClick={() => setSettingsOpen(true)}
            />
          </>
        ) : undefined
      }
    />
  );

  const settingsDialog = settingsAvailable ? (
    <ReadingSettings
      open={settingsOpen}
      sampleText={sampleText}
      size={arabicSize.size}
      translationSize={translationSize.size}
      failed={arabicSize.failed || translationSize.failed || translationVisible.failed}
      onChangeSize={arabicSize.setSize}
      onChangeTranslationSize={translationSize.setSize}
      onReset={() => {
        arabicSize.resetSize();
        translationSize.resetSize();
        translationVisible.reset();
        setForceTranslation(false);
      }}
      showTranslation={showTranslation}
      onChangeShowTranslation={(next) => {
        setForceTranslation(false);
        translationVisible.setVisible(next);
      }}
      onClose={() => setSettingsOpen(false)}
    />
  ) : null;

  if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
    return (
      <>
        {topBar}
        <PageContainer width="reader">
          <ErrorState
            title="Surah tidak ditemukan."
            description="Nomor surah harus antara 1 dan 114."
            action={<ButtonLink to="/surah">Kembali ke indeks</ButtonLink>}
          />
        </PageContainer>
      </>
    );
  }

  if (surahs.status === "loading") {
    return (
      <>
        {topBar}
        <ReaderSkeleton />
      </>
    );
  }

  if (surahs.status === "error") {
    return (
      <>
        {topBar}
        <PageContainer width="reader">
          <ErrorState
            title="Daftar surah belum dapat dimuat."
            description="Coba lagi untuk membuka surah ini."
            action={
              <div className={styles.errorActions}>
                <Button onClick={surahs.retry}>Coba lagi</Button>
                <ButtonLink to="/surah" variant="secondary">
                  Kembali ke indeks
                </ButtonLink>
              </div>
            }
          />
        </PageContainer>
      </>
    );
  }

  if (!surah) {
    return (
      <>
        {topBar}
        <PageContainer width="reader">
          <ErrorState
            title="Surah tidak ditemukan."
            description="Nomor surah harus antara 1 dan 114."
            action={<ButtonLink to="/surah">Kembali ke indeks</ButtonLink>}
          />
        </PageContainer>
      </>
    );
  }

  const previous = surahNumber > 1 ? surahs.data[surahNumber - 2] : null;
  const next = surahNumber < 114 ? surahs.data[surahNumber] : null;
  const from = `${location.pathname}${location.search}`;

  return (
    <>
      {topBar}
      <ReaderContent
        key={surah.n}
        surah={surah}
        previous={previous ?? null}
        next={next ?? null}
        targetAyah={targetAyah}
        invalidAyahLabel={invalidAyahLabel}
        from={from}
        text={text}
        translation={translation}
        arabicSize={arabicSize.size}
        translationSize={translationSize.size}
        showTranslation={showTranslation}
      />
      {settingsDialog}
      {jumpOpen ? (
        <JumpToDialog
          surahs={surahs.data}
          initialSurah={surah.n}
          onClose={() => setJumpOpen(false)}
          onNavigate={(targetSurah, targetAyah) => {
            setJumpOpen(false);
            if (targetAyah) {
              navigate(`/surah/${targetSurah}/${targetAyah}`);
            } else {
              navigate(`/surah/${targetSurah}`);
              window.scrollTo({ top: 0 });
            }
          }}
        />
      ) : null}
    </>
  );
}

interface ReaderContentProps {
  surah: Surah;
  previous: Surah | null;
  next: Surah | null;
  targetAyah: number | null;
  invalidAyahLabel: string | null;
  from: string;
  text: AsyncResource<SurahText>;
  translation: AsyncResource<SurahTranslation>;
  arabicSize: ArabicSize;
  translationSize: TranslationSize;
  showTranslation: boolean;
}

function ReaderContent({
  surah,
  previous,
  next,
  targetAyah,
  invalidAyahLabel,
  from,
  text,
  translation,
  arabicSize,
  translationSize,
  showTranslation,
}: ReaderContentProps) {
  const online = useOnlineStatus();
  const basmalah = useBasmalah();
  const bookmarks = useBookmarksForSurah(surah.n);
  const lastSaved = useRef<string>("");
  const [selected, setSelected] = useState<number | null>(null);
  const [dismissedNotice, setDismissedNotice] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const noticeVisible = invalidAyahLabel !== null && invalidAyahLabel !== dismissedNotice;

  const dismissToast = useCallback(() => setToast(null), []);
  const notify = useCallback((message: string, tone: "success" | "error" = "success") => {
    setToast({ message, tone });
  }, []);

  const persistPosition = useCallback(
    (ayah: number) => {
      const key = `${surah.n}:${ayah}`;
      if (lastSaved.current === key) return;
      lastSaved.current = key;
      void saveReadingPosition(surah.n, ayah).catch(() => {
        // Posisi tetap dipakai di sesi ini; penyimpanan dapat dicoba lagi saat bergulir.
      });
    },
    [surah.n],
  );

  useEffect(() => {
    if (text.status !== "success") return;
    persistPosition(targetAyah ?? 1);
  }, [persistPosition, targetAyah, text.status]);

  // Gulir programatik (mis. deep link ke ayat) tidak boleh menimpa posisi awal.
  // Posisi baru dicatat setelah pengguna benar-benar menggulir. Ketukan untuk
  // memilih ayat tidak dihitung: memuat terjemahan dapat menggeser tata letak
  // dan memicu peristiwa scroll tanpa niat pengguna.
  const userInteracted = useRef(false);
  const [engaged, setEngaged] = useState(false);

  useEffect(() => {
    const markInteracted = () => {
      userInteracted.current = true;
    };
    const events = ["wheel", "touchmove", "keydown"] as const;
    for (const name of events) {
      window.addEventListener(name, markInteracted, { passive: true });
    }
    return () => {
      for (const name of events) {
        window.removeEventListener(name, markInteracted);
      }
    };
  }, []);

  useEffect(() => {
    if (text.status !== "success") return;

    let frame = 0;
    const update = () => {
      frame = 0;
      if (!userInteracted.current) return;
      const threshold = 96;
      for (const card of document.querySelectorAll<HTMLElement>("[data-ayah]")) {
        if (card.getBoundingClientRect().bottom <= threshold) continue;
        const ayah = Number(card.dataset.ayah);
        if (Number.isInteger(ayah) && ayah > 0) {
          if (ayah >= 5) setEngaged(true);
          persistPosition(ayah);
        }
        return;
      }
    };

    const handleScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, [persistPosition, text.status]);

  const handleToggleBookmark = useCallback(
    async (ayah: number) => {
      const isBookmarked = bookmarks.bookmarked.has(ayah);
      const createdAt = bookmarks.createdAt.get(ayah);
      try {
        await setBookmark(surah.n, ayah, !isBookmarked);
        if (isBookmarked) {
          setToast({
            message: "Penanda dihapus.",
            tone: "success",
            action: {
              label: "Urungkan",
              onClick: () => {
                setToast(null);
                void addBookmark(surah.n, ayah, createdAt).catch(() => {
                  setToast({ message: "Penanda tidak dapat dipulihkan.", tone: "error" });
                });
              },
            },
          });
        } else {
          setToast({ message: "Penanda ditambahkan.", tone: "success" });
        }
      } catch {
        setToast({ message: "Penanda tidak dapat disimpan. Coba lagi.", tone: "error" });
      }
    },
    [bookmarks.bookmarked, bookmarks.createdAt, surah.n],
  );

  useEffect(() => {
    if (text.status !== "success" || targetAyah === null) return;

    const frame = window.requestAnimationFrame(() => {
      // Ayat 1 digulir ke atas agar basmalah di bawah petunjuk tetap terlihat.
      if (targetAyah === 1) {
        window.scrollTo({ top: 0 });
        return;
      }
      document.getElementById(`ayah-${targetAyah}`)?.scrollIntoView({ block: "center" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [targetAyah, text.status]);

  useEffect(() => {
    if (selected === null) return;

    const handlePointerDown = (event: PointerEvent) => {
      const element = event.target;
      if (element instanceof Element && element.closest("[data-ayah]")) return;
      setSelected(null);
    };

    // Gulir programatik atau pergeseran tata letak saat terjemahan dimuat tidak
    // boleh membatalkan pilihan. Hanya gestur gulir pengguna yang menutup aksi.
    const handleIntent = () => setSelected(null);
    const events = ["wheel", "touchmove"] as const;
    for (const name of events) {
      window.addEventListener(name, handleIntent, { passive: true });
    }
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      for (const name of events) {
        window.removeEventListener(name, handleIntent);
      }
    };
  }, [selected]);

  if (text.status === "loading") {
    return <ReaderSkeleton />;
  }

  if (text.status === "error") {
    return (
      <PageContainer width="reader">
        <ErrorState
          title="Surah belum dapat dimuat."
          description={
            !online
              ? "Surah ini belum tersedia offline. Sambungkan internet sekali untuk menyimpannya."
              : "Data surah tidak dapat dimuat. Coba lagi."
          }
          action={
            <div className={styles.errorActions}>
              <Button onClick={text.retry}>Coba lagi</Button>
              <ButtonLink to="/surah" variant="secondary">
                Kembali ke indeks
              </ButtonLink>
            </div>
          }
        />
      </PageContainer>
    );
  }

  const selectedReference =
    selected !== null ? formatReference(surah.nameLatin, surah.n, selected) : "";

  const showBasmalah = surah.n !== 1 && surah.n !== 9 && basmalah.status === "success";

  return (
    <PageContainer width="reader">
      <SurahHeader surah={surah} />

      <p className={styles.hint}>Ketuk ayat untuk membuka aksi.</p>

      {showBasmalah ? (
        <p className={styles.basmalah} dir="rtl" lang="ar" data-basmalah>
          {basmalah.data.text}
        </p>
      ) : null}

      {showTranslation && translation.status === "error" ? (
        <div className={styles.notice} role="status">
          <p>Terjemahan belum dapat dimuat.</p>
          <Button variant="ghost" onClick={translation.retry}>
            Coba lagi
          </Button>
        </div>
      ) : null}

      {noticeVisible && invalidAyahLabel ? (
        <div className={styles.notice} role="status">
          <p>
            Ayat {invalidAyahLabel} tidak ditemukan. Surah ini memiliki {surah.ayahCount} ayat.
          </p>
          <Button variant="ghost" onClick={() => setDismissedNotice(invalidAyahLabel)}>
            Tutup
          </Button>
        </div>
      ) : null}

      <div className={styles.srAnnouncement} aria-live="polite">
        {selected !== null
          ? `Ayat ${selected} dari ${surah.ayahCount}, ${selectedReference}, terpilih`
          : null}
      </div>

      <ol className={styles.ayahList}>
        {text.data.ayahs.map((ayah) => (
          <AyahCard
            key={ayah.n}
            surah={surah}
            ayah={ayah}
            selected={selected === ayah.n}
            targeted={targetAyah === ayah.n}
            bookmarked={bookmarks.bookmarked.has(ayah.n)}
            arabicSize={arabicSize}
            translationSize={translationSize}
            translation={
              showTranslation && translation.status === "success"
                ? translation.data.ayahs[ayah.n - 1]
                : undefined
            }
            onSelect={setSelected}
            onToggleBookmark={handleToggleBookmark}
            onNotify={notify}
          />
        ))}
      </ol>

      <AyahNav previous={previous} next={next} from={from} />
      <AttributionFooter />
      <BackToTop />

      {toast ? (
        <Snackbar
          message={toast.message}
          tone={toast.tone}
          action={toast.action}
          onDismiss={dismissToast}
        />
      ) : null}

      <InstallPrompt show={engaged && toast === null} />
    </PageContainer>
  );
}

function ReaderSkeleton() {
  return (
    <PageContainer width="reader">
      <div className={styles.skeletonHeader} aria-hidden="true">
        <Skeleton width="8rem" height="2.25rem" radius="md" />
        <Skeleton width="6rem" height="1.4rem" />
        <Skeleton width="8rem" height="0.8rem" />
      </div>
      <div className={styles.skeletonAyahs} aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className={styles.skeletonAyah}>
            <Skeleton width="7rem" height="0.75rem" />
            <Skeleton width="100%" height="2rem" radius="sm" />
            <Skeleton width="72%" height="2rem" radius="sm" />
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
