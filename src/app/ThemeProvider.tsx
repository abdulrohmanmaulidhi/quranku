import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { db } from "@/lib/db/db";
import { applyTheme, getStoredTheme, isThemePreference, watchSystemTheme } from "@/lib/theme";
import type { ThemePreference } from "@/lib/theme";
import { ThemeContext } from "./ThemeContext";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(getStoredTheme);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    db.settings
      .get("theme")
      .then((row) => {
        if (!cancelled && isThemePreference(row?.value)) {
          setPreferenceState(row.value);
        }
      })
      .catch(() => {
        // localStorage tetap menjadi cadangan bila IndexedDB tidak tersedia.
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    applyTheme(preference, true);

    if (hydrated) {
      void db.settings.put({ key: "theme", value: preference }).catch(() => {
        // Preferensi tetap berlaku di sesi ini meski penyimpanan gagal.
      });
    }

    if (preference !== "system") return;
    return watchSystemTheme(() => applyTheme("system", false));
  }, [preference, hydrated]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
  }, []);

  const value = useMemo(() => ({ preference, setPreference }), [preference, setPreference]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
