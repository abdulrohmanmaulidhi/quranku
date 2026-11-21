import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearDataCache } from "@/lib/data/client";
import { clearSearchIndexCache } from "@/lib/search/index";
import { findHighlightRanges } from "@/lib/search/normalize";
import { SearchPage } from "@/pages/SearchPage";
import { readDataFileForUrl, readSurahText, readSurahTranslation } from "./helpers";

vi.mock("@/lib/useDocumentTitle", () => ({
  useDocumentTitle: () => undefined,
}));

const fatihah = readSurahText(1);
const fatihahTranslation = readSurahTranslation(1);

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

    const link = await screen.findByRole("link", { name: /Al-Fatihah 1:3/ });

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

    const link = await screen.findByRole("link", { name: /Al-Fatihah 1:3/ });
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

  it("mencari terjemahan dan menyorot kata yang cocok", async () => {
    renderSearch("/cari?mode=terjemahan&q=pengasih");

    const link = await screen.findByRole("link", { name: /Al-Fatihah 1:1/ });
    expect(link).toHaveAttribute("href", "/surah/1/1");
    const text = await waitFor(() => {
      const element = link.querySelector("[lang='id']");
      expect(element).not.toBeNull();
      return element as HTMLElement;
    });
    expect(text.textContent).toBe(fatihahTranslation.ayahs[0]!.text);
    expect(text.querySelector("mark")?.textContent?.toLowerCase()).toBe("pengasih");
  });

  it("meminta kueri terjemahan minimal tiga huruf", async () => {
    renderSearch("/cari?mode=terjemahan&q=ma");

    expect(
      await screen.findByText("Ketik minimal tiga huruf untuk mulai mencari ayat."),
    ).toBeInTheDocument();
  });

  it("menampilkan 20 hasil lalu menambah 20 setiap kali diminta", async () => {
    const user = userEvent.setup();
    renderSearch(`/cari?mode=arab&q=${encodeURIComponent("الله")}`);

    expect(await screen.findByText(/Menampilkan 20 dari \d+ hasil\./)).toBeInTheDocument();
    const list = screen.getByRole("list");
    expect(within(list).getAllByRole("link")).toHaveLength(20);

    await user.click(screen.getByRole("button", { name: "Tampilkan 20 hasil lagi" }));

    expect(within(list).getAllByRole("link")).toHaveLength(40);
    expect(screen.getByText(/Menampilkan 40 dari \d+ hasil\./)).toBeInTheDocument();
  });

  it("berhenti menambah hasil pada batas 100", async () => {
    const user = userEvent.setup();
    renderSearch(`/cari?mode=arab&q=${encodeURIComponent("الله")}`);

    const more = await screen.findByRole("button", { name: "Tampilkan 20 hasil lagi" });
    for (let click = 0; click < 4; click += 1) {
      await user.click(more);
    }

    expect(screen.getByRole("list").querySelectorAll("a")).toHaveLength(100);
    expect(
      screen.queryByRole("button", { name: "Tampilkan 20 hasil lagi" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/Menampilkan 100 dari \d+ hasil\. Persempit kata kunci untuk hasil lain\./),
    ).toBeInTheDocument();
  });
});
