import { Link } from "react-router-dom";
import styles from "./AttributionFooter.module.css";

export function AttributionFooter() {
  return (
    <footer className={styles.footer}>
      <p className={styles.source}>Teks Arab: Tanzil (CC BY 3.0)</p>
      <Link className={styles.link} to="/pengaturan/sumber">
        Sumber &amp; Atribusi
      </Link>
    </footer>
  );
}
