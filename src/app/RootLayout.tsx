import { Suspense, useEffect } from "react";
import { Outlet, ScrollRestoration, useLocation, useMatch } from "react-router-dom";
import { BottomNav } from "@/components/layout/BottomNav";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { OfflineSetupBanner } from "@/components/layout/OfflineSetupBanner";
import { PwaUpdatePrompt } from "@/components/layout/PwaUpdatePrompt";
import { SideNav } from "@/components/layout/SideNav";
import { SkipLink } from "@/components/layout/SkipLink";
import { Skeleton } from "@/components/ui/Skeleton";
import styles from "./RootLayout.module.css";

export function RootLayout() {
  const location = useLocation();
  const isReader = useMatch("/surah/:surah/*") !== null;

  useEffect(() => {
    const main = document.getElementById("main-content");
    main?.focus({ preventScroll: true });
  }, [location.pathname]);

  return (
    <div className={styles.shell}>
      <SkipLink />
      <SideNav />
      <div className={styles.content}>
        <OfflineBanner />
        <OfflineSetupBanner />
        <main
          id="main-content"
          tabIndex={-1}
          className={[styles.main, isReader ? styles.reader : ""].filter(Boolean).join(" ")}
        >
          <Suspense
            fallback={
              <div className={styles.fallback} role="status">
                <span className="sr-only">Memuat halaman…</span>
                <div aria-hidden="true" className={styles.fallbackSkeleton}>
                  <Skeleton width="10rem" height="2rem" />
                  <Skeleton width="100%" height="5rem" radius="md" />
                </div>
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
        {isReader ? null : <BottomNav />}
      </div>
      <PwaUpdatePrompt />
      <ScrollRestoration />
    </div>
  );
}
