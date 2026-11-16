import { CloudOff } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { useOnlineStatus } from "@/lib/useOnlineStatus";
import styles from "./OfflineBanner.module.css";

export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <Icon icon={CloudOff} size={16} />
      <span>Offline · bacaan tetap tersedia</span>
    </div>
  );
}
