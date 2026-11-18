import { lazy } from "react";

/**
 * Halaman dimuat sesuai rute agar muatan awal tidak membawa seluruh layar.
 * Berkas ini hanya mengekspor komponen agar aturan Fast Refresh tetap berlaku.
 */
export const HomePage = lazy(() =>
  import("@/pages/HomePage").then((module) => ({ default: module.HomePage })),
);
export const SurahIndexPage = lazy(() =>
  import("@/pages/SurahIndexPage").then((module) => ({ default: module.SurahIndexPage })),
);
export const ReaderPage = lazy(() =>
  import("@/pages/ReaderPage").then((module) => ({ default: module.ReaderPage })),
);
export const SearchPage = lazy(() =>
  import("@/pages/SearchPage").then((module) => ({ default: module.SearchPage })),
);
export const BookmarksPage = lazy(() =>
  import("@/pages/BookmarksPage").then((module) => ({ default: module.BookmarksPage })),
);
export const SettingsPage = lazy(() =>
  import("@/pages/SettingsPage").then((module) => ({ default: module.SettingsPage })),
);
export const SourcesPage = lazy(() =>
  import("@/pages/SourcesPage").then((module) => ({ default: module.SourcesPage })),
);
export const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })),
);
