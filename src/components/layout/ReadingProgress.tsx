import { useEffect, useRef } from "react";
import styles from "./ReadingProgress.module.css";

/**
 * Progres baca berdasarkan posisi gulir. Nilai diperbarui lewat DOM, bukan
 * state React, agar daftar ayat yang panjang tidak dirender ulang tiap frame.
 */
export function ReadingProgress() {
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const fill = fillRef.current;
    if (!track || !fill) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 1;
      fill.style.transform = `scaleX(${ratio})`;
      track.setAttribute("aria-valuenow", String(Math.round(ratio * 100)));
    };
    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    // Terjemahan dan font dimuat setelah render awal dan mengubah tinggi
    // halaman; progres harus menyesuaikan tanpa menunggu gulir berikutnya.
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedule);
    observer?.observe(document.body);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer?.disconnect();
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={trackRef}
      className={styles.track}
      role="progressbar"
      aria-label="Progres baca"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
    >
      <div ref={fillRef} className={styles.fill} />
    </div>
  );
}
