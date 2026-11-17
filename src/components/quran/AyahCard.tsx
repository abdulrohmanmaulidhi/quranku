import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Bookmark, BookmarkCheck, Copy, Ellipsis, Share2 } from "lucide-react";
import type { Ayah, Surah, TranslationAyah } from "@/lib/data/types";
import { formatReference } from "@/lib/format/reference";
import { copyText } from "@/lib/clipboard";
import { buildAyahCopy, buildReferenceCopy } from "@/features/quran/copy";
import { ArabicText, type ArabicSize } from "./ArabicText";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import styles from "./AyahCard.module.css";

export interface AyahCardProps {
  surah: Surah;
  ayah: Ayah;
  selected: boolean;
  targeted: boolean;
  bookmarked: boolean;
  arabicSize?: ArabicSize;
  translation?: TranslationAyah;
  onSelect: (ayah: number) => void;
  onToggleBookmark: (ayah: number) => void;
  onNotify: (message: string, tone?: "success" | "error") => void;
}

export function AyahCard({
  surah,
  ayah,
  selected,
  targeted,
  bookmarked,
  arabicSize = "m",
  translation,
  onSelect,
  onToggleBookmark,
  onNotify,
}: AyahCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPlacement, setMenuPlacement] = useState<"bottom" | "top">("bottom");
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const reference = formatReference(surah.nameLatin, surah.n, ayah.n);

  useLayoutEffect(() => {
    if (!menuOpen) return;
    const menu = menuRef.current;
    if (!menu) return;

    const rect = menu.getBoundingClientRect();
    setMenuPlacement(rect.bottom > window.innerHeight - 8 ? "top" : "bottom");
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest(`[data-ayah="${ayah.n}"]`)) return;
      setMenuOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [ayah.n, menuOpen]);

  const select = () => {
    setMenuOpen(false);
    onSelect(ayah.n);
  };

  const handleTextClick = () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) return;
    select();
  };

  const handleCopyReference = async () => {
    const ok = await copyText(buildReferenceCopy(surah, ayah));
    setMenuOpen(false);
    onNotify(
      ok ? "Referensi disalin." : "Tidak dapat menyalin. Coba lagi.",
      ok ? "success" : "error",
    );
  };

  const handleCopyAyah = async () => {
    const ok = await copyText(buildAyahCopy(surah, ayah, translation));
    setMenuOpen(false);
    onNotify(ok ? "Ayat disalin." : "Tidak dapat menyalin. Coba lagi.", ok ? "success" : "error");
  };

  const handleToggleBookmark = () => {
    setMenuOpen(false);
    onToggleBookmark(ayah.n);
  };

  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const handleShare = async () => {
    if (!canShare) return;
    setMenuOpen(false);
    try {
      await navigator.share({
        title: reference,
        text: buildAyahCopy(surah, ayah, translation),
        url: `${window.location.origin}/surah/${surah.n}/${ayah.n}`,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      onNotify("Tidak dapat membagikan. Coba lagi.", "error");
    }
  };

  return (
    <li
      id={`ayah-${ayah.n}`}
      data-ayah={ayah.n}
      className={[styles.item, targeted ? styles.targeted : "", selected ? styles.selected : ""]
        .filter(Boolean)
        .join(" ")}
      onKeyDown={(event) => {
        if (event.key === "Escape") setMenuOpen(false);
      }}
    >
      <article aria-label={`Ayat ${ayah.n} dari ${surah.ayahCount}, ${reference}`}>
        <div className={styles.meta}>
          <button
            type="button"
            className={styles.marker}
            aria-label={`Pilih ayat ${ayah.n}`}
            aria-pressed={selected}
            onClick={select}
          >
            <span className={styles.markerCircle}>{ayah.n}</span>
          </button>
          <span className={styles.reference}>{reference}</span>
          {bookmarked ? (
            <span className={styles.bookmarkMark}>
              <Icon icon={Bookmark} size={14} filled />
              <span className="sr-only">Ditandai</span>
            </span>
          ) : null}
          {targeted ? <span className={styles.targetLabel}>Ayat dituju</span> : null}
        </div>

        <div className={styles.text} data-ayah-text onClick={handleTextClick}>
          <ArabicText text={ayah.text} size={arabicSize} />
        </div>

        {translation ? (
          <div className={styles.translation} lang="id">
            <p className={styles.translationText} onClick={handleTextClick}>
              {translation.text}
            </p>
            {translation.footnotes ? (
              <details className={styles.footnotes}>
                <summary className={styles.footnotesSummary}>Catatan kaki</summary>
                <p className={styles.footnoteText}>{translation.footnotes}</p>
              </details>
            ) : null}
          </div>
        ) : null}

        {selected ? (
          <div className={styles.actionBar}>
            <span className={styles.actionLabel}>Aksi ayat {ayah.n}</span>
            <IconButton
              icon={Ellipsis}
              label={`Aksi ayat ${ayah.n}`}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuOpen((open) => !open)}
            />
            {menuOpen ? (
              <div
                id={menuId}
                ref={menuRef}
                className={[styles.menu, menuPlacement === "top" ? styles.menuTop : ""]
                  .filter(Boolean)
                  .join(" ")}
                role="group"
                aria-label={`Aksi ayat ${ayah.n}`}
              >
                <button type="button" className={styles.menuItem} onClick={handleToggleBookmark}>
                  <Icon
                    icon={bookmarked ? BookmarkCheck : Bookmark}
                    size={18}
                    filled={bookmarked}
                  />
                  <span>{bookmarked ? "Hapus penanda" : "Beri penanda"}</span>
                </button>
                <button type="button" className={styles.menuItem} onClick={handleCopyReference}>
                  <Icon icon={Copy} size={18} />
                  <span>Salin referensi</span>
                </button>
                <button type="button" className={styles.menuItem} onClick={handleCopyAyah}>
                  <Icon icon={Copy} size={18} />
                  <span>Salin ayat</span>
                </button>
                {canShare ? (
                  <button type="button" className={styles.menuItem} onClick={handleShare}>
                    <Icon icon={Share2} size={18} />
                    <span>Bagikan ayat</span>
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </article>
    </li>
  );
}
