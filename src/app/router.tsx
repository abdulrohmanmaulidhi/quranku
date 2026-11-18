import { createBrowserRouter, redirect } from "react-router-dom";
import { RootLayout } from "./RootLayout";
import {
  BookmarksPage,
  HomePage,
  NotFoundPage,
  ReaderPage,
  SearchPage,
  SettingsPage,
  SourcesPage,
  SurahIndexPage,
} from "./lazyPages";
import { RouteErrorPage } from "@/pages/RouteErrorPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "surah", element: <SurahIndexPage /> },
      { path: "surah/:surah", element: <ReaderPage /> },
      { path: "surah/:surah/:ayah", element: <ReaderPage /> },
      { path: "cari", element: <SearchPage /> },
      { path: "penanda", element: <BookmarksPage /> },
      { path: "pengaturan", element: <SettingsPage /> },
      { path: "pengaturan/sumber", element: <SourcesPage /> },
      { path: "sumber", loader: () => redirect("/pengaturan/sumber") },
      { path: "quran", loader: () => redirect("/surah") },
      {
        path: "quran/:surah",
        loader: ({ params, request }) => {
          const url = new URL(request.url);
          return redirect(`/surah/${params.surah ?? ""}${url.search}`);
        },
      },
      {
        path: "quran/:surah/:ayah",
        loader: ({ params, request }) => {
          const url = new URL(request.url);
          return redirect(`/surah/${params.surah ?? ""}/${params.ayah ?? ""}${url.search}`);
        },
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
