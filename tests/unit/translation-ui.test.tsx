import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearDataCache } from "@/lib/data/client";
import { db } from "@/lib/db/db";
import { ReaderPage } from "@/pages/ReaderPage";
import { SourcesPage } from "@/pages/SourcesPage";
import { readDataFileForUrl, readSurahTranslation } from "./helpers";

vi.mock("@/lib/useDocumentTitle", () => ({
  useDocumentTitle: () => undefined,
}));

const fatihah = readSurahTranslation(1);

function installDataFetch() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const content = readDataFileForUrl(input);
      return {
        ok: true,
        status: 200,
        json: async () => JSON.parse(content),
      } as Response;
    }),
  );
}

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      { path: "/surah/:surah/:ayah?", element: <ReaderPage /> },
      { path: "/pengaturan/sumber", element: <SourcesPage /> },
    ],
    { initialEntries: [path] },
  );
  return render(<RouterProvider router={router} />);
}

beforeEach(async () => {
  clearDataCache();
  installDataFetch();
  await Promise.all([db.bookmarks.clear(), db.position.clear(), db.settings.clear()]);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("terjemahan di Reader", () => {
  it("menampilkan terjemahan apa adanya dengan tautan atribusi di kaki halaman", async () => {
    renderAt("/surah/1");

    expect(await screen.findByText(fatihah.ayahs[0]!.text)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "detail sumber" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sumber & Atribusi" })).toHaveAttribute(
      "href",
      "/pengaturan/sumber",
    );
  });

  it("menampilkan catatan kaki per ayat tanpa mengubah penanda", async () => {
    const ayah = fatihah.ayahs.find((row) => row.n === 4)!;
    renderAt("/surah/1/4");

    expect(await screen.findByText(ayah.text)).toBeInTheDocument();
    const summary = document.querySelector("#ayah-4 details summary");
    expect(summary?.textContent).toBe("Catatan kaki");
    expect(document.querySelector("#ayah-4 details p")?.textContent).toBe(ayah.footnotes);
    expect(ayah.text).toContain("[1]");
  });

  it("menyembunyikan terjemahan lewat pengaturan dan menyimpannya", async () => {
    const user = userEvent.setup();
    renderAt("/surah/1");

    await screen.findByText(fatihah.ayahs[0]!.text);
    await user.click(screen.getByRole("button", { name: "Pengaturan baca" }));

    const toggle = screen.getByRole("checkbox", { name: "Tampilkan terjemahan" });
    expect(toggle).toBeChecked();
    await user.click(toggle);

    await waitFor(() => {
      expect(screen.queryByText(fatihah.ayahs[0]!.text)).not.toBeInTheDocument();
    });
    expect(await db.settings.get("reader.showTranslation")).toEqual({
      key: "reader.showTranslation",
      value: false,
    });
  });

  it("menghormati pilihan tersimpan saat dibuka lagi", async () => {
    await db.settings.put({ key: "reader.showTranslation", value: false });
    renderAt("/surah/1");

    expect(
      await screen.findByRole("heading", { level: 1, name: "Al-Faatiha" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(fatihah.ayahs[0]!.text)).not.toBeInTheDocument();
  });

  it("mengubah ukuran teks terjemahan dan menyimpannya", async () => {
    const user = userEvent.setup();
    renderAt("/surah/1");

    const text = await screen.findByText(fatihah.ayahs[0]!.text);
    expect(text.closest("[data-size]")).toHaveAttribute("data-size", "m");

    await user.click(screen.getByRole("button", { name: "Pengaturan baca" }));
    await user.click(screen.getByRole("button", { name: "Perbesar teks terjemahan" }));

    await waitFor(() => {
      expect(text.closest("[data-size]")).toHaveAttribute("data-size", "l");
    });
    expect(await db.settings.get("reader.translationSize")).toEqual({
      key: "reader.translationSize",
      value: "l",
    });
  });

  it("memakai ukuran terjemahan tersimpan saat dibuka lagi", async () => {
    await db.settings.put({ key: "reader.translationSize", value: "xl" });
    renderAt("/surah/1");

    const text = await screen.findByText(fatihah.ayahs[0]!.text);
    expect(text.closest("[data-size]")).toHaveAttribute("data-size", "xl");
  });
});

describe("atribusi terjemahan di S10", () => {
  it("mencatat penerbit, QuranEnc, versi, dan syarat pemakaian", async () => {
    renderAt("/pengaturan/sumber");

    expect(await screen.findByText(/Ministry of Religious Affairs/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /QuranEnc\.com/ })).toHaveAttribute(
      "href",
      "https://quranenc.com/en/home",
    );
    expect(screen.getByText("1.0.1")).toBeInTheDocument();
    expect(screen.getByText("QuranEnc Terms and Policies")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Syarat pemakaian dan rincian sumber/ }),
    ).toHaveAttribute("href", expect.stringContaining("tr/indonesian_affairs/SOURCE.txt"));
  });
});
