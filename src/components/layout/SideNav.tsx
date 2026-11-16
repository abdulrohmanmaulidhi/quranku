import { Bookmark, BookOpen, House, Search, SlidersHorizontal } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { Icon } from "../ui/Icon";
import styles from "./SideNav.module.css";

const items = [
  { to: "/", label: "Beranda", icon: House, end: true },
  { to: "/surah", label: "Baca Quran", icon: BookOpen, end: false },
  { to: "/cari", label: "Cari", icon: Search, end: false },
  { to: "/penanda", label: "Penanda", icon: Bookmark, end: false },
  { to: "/pengaturan", label: "Pengaturan", icon: SlidersHorizontal, end: false },
] as const;

export function SideNav() {
  return (
    <aside className={styles.side}>
      <Link to="/" className={styles.brand}>
        Quranku
        <span className={styles.brandSub}>Al-Qur'an</span>
      </Link>
      <nav className={styles.nav} aria-label="Navigasi utama">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [styles.item, isActive ? styles.active : ""].filter(Boolean).join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <Icon icon={item.icon} size={20} filled={isActive} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className={styles.footer}>
        <Link to="/sumber" className={styles.footerLink}>
          Sumber &amp; atribusi
        </Link>
        <p className={styles.footerNote}>Teks Arab: Tanzil (CC BY 3.0)</p>
      </div>
    </aside>
  );
}
