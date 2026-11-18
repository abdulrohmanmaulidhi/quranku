import { Bookmark, BookOpen, House, SlidersHorizontal } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Icon } from "../ui/Icon";
import styles from "./BottomNav.module.css";

const items = [
  { to: "/", label: "Beranda", icon: House, end: true },
  { to: "/surah", label: "Quran", icon: BookOpen, end: false },
  { to: "/penanda", label: "Penanda", icon: Bookmark, end: false },
  { to: "/pengaturan", label: "Pengaturan", icon: SlidersHorizontal, end: false },
] as const;

export function BottomNav() {
  return (
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
          <span className={styles.icon}>
            <Icon icon={item.icon} size={22} />
          </span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
