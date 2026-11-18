import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Icon } from "../ui/Icon";
import styles from "./BackToTop.module.css";

/** Tombol gulir instan ke atas; muncul setelah satu layar tergulir. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const next = window.scrollY > window.innerHeight;
      setVisible((previous) => (previous === next ? previous : next));
    };
    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, []);

  const handleClick = () => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      aria-label="Kembali ke atas"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      data-visible={visible}
      className={styles.button}
      onClick={handleClick}
    >
      <Icon icon={ArrowUp} size={20} />
    </button>
  );
}
