import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearDataCache } from "@/lib/data/client";
import { clearSearchIndexCache } from "@/lib/search/index";
import { findHighlightRanges } from "@/lib/search/normalize";
import { SearchPage } from "@/pages/SearchPage";
import { readSurahText } from "./helpers";

vi.mock("@/lib/useDocumentTitle", () => ({
  useDocumentTitle: () => undefined,
}));

const fatihah = readSurahText(1);

function installDataFetch() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input), "http://localhost");
      const relative = url.pathname.split("/data/v1/")[1];
      if (!relative) throw new Error(`Alamat data tidak dikenal: ${url.pathname}`);
      const content = readFileSync(join(process.cwd(), "public", "data", "v1", relative), "utf8");
      return {
        ok: true,
        status: 200,
        json: async () => JSON.parse(content),
      } as Response;
    }),
  );
}

function renderSearch(initialEntry: string) {
  const router = createMemoryRouter([{ path: "/cari", element: <SearchPage /> }], {
    initialEntries: [initialEntry],
  });
  return render(<RouterProvider router={router} />);
}

beforeEach(() => {
  clearDataCache();
  clearSearchIndexCache();
  installDataFetch();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("S08 — Cari", () => {
  it("mencari surah berdasarkan nama", async () => {
    renderSearch("/cari?mode=surah&q=kahf");

    const link = await screen.findByRole("link", { name: /Al-Kahf/ });
    expect(link).toHaveAttribute("href", "/surah/18");
  });

  it("menampilkan hasil ayat Arab dengan teks verbatim dan sorotan", async () => {
    renderSearch(`/cari?mode=arab&q=${encodeURIComponent("الرحمن")}`);

    const link = await screen.findByRole("link", { name: /Al-Faatiha 1:3/ });

    expect(link).toHaveAttribute("href", "/surah/1/3");
    await waitFor(() => {
      expect(link.querySelector("[dir='rtl']")?.textContent).toBe(fatihah.ayahs[2]?.text);
    });
    const arabic = link.querySelector("[dir='rtl']");
    const expectedRanges = findHighlightRanges(fatihah.ayahs[2]?.text ?? "", "الرحمن");
    expect(arabic?.querySelector("mark")?.textContent).toBe(
      (fatihah.ayahs[2]?.text ?? "").slice(expectedRanges[0]!.start, expectedRanges[0]!.end),
    );
  });

  it("memberi hasil yang sama untuk kueri berharakat", async () => {
    renderSearch(`/cari?mode=arab&q=${encodeURIComponent("ٱلرَّحْمَـٰنِ")}`);

    const link = await screen.findByRole("link", { name: /Al-Faatiha 1:3/ });
    expect(link).toHaveAttribute("href", "/surah/1/3");
  });

  it("menampilkan petunjuk bahwa harakat diabaikan", () => {
    renderSearch("/cari?mode=arab");

    expect(screen.getByText("Pencarian Arab mengabaikan harakat.")).toBeInTheDocument();
  });

  it("meminta kueri minimal dua huruf", async () => {
    renderSearch("/cari?mode=arab&q=%D8%A7");

    expect(
      await screen.findByText("Ketik minimal dua huruf untuk mulai mencari ayat."),
    ).toBeInTheDocument();
  });

  it("menampilkan keadaan kosong saat tidak ada ayat yang cocok", async () => {
    renderSearch(`/cari?mode=arab&q=${encodeURIComponent("زززززززز")}`);

    expect(await screen.findByText(/Tidak ada hasil untuk/)).toBeInTheDocument();
  });
});
