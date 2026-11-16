import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearDataCache } from "@/lib/data/client";
import { addBookmark, db, saveReadingPosition } from "@/lib/db/db";
import { BookmarksPage } from "@/pages/BookmarksPage";
import { HomePage } from "@/pages/HomePage";

vi.mock("@/lib/useDocumentTitle", () => ({
  useDocumentTitle: () => undefined,
}));

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

beforeEach(async () => {
  clearDataCache();
  installDataFetch();
  await Promise.all([db.bookmarks.clear(), db.position.clear(), db.settings.clear()]);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Beranda — lanjutkan membaca", () => {
  it("menampilkan tombol mulai membaca pada kunjungan pertama", async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("link", { name: "Mulai membaca" })).toBeInTheDocument();
    expect(screen.queryByText("Lanjutkan membaca")).not.toBeInTheDocument();
  });

  it("menampilkan kartu lanjutkan membaca dari posisi tersimpan", async () => {
    await saveReadingPosition(18, 10);

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Lanjutkan membaca")).toBeInTheDocument();
    const resume = screen.getByRole("link", { name: /Lanjutkan membaca/ });
    expect(resume).toHaveTextContent("Al-Kahf");
    expect(resume).toHaveTextContent("Ayat 10 dari 110");
    expect(resume).toHaveAttribute("href", "/surah/18/10");
    expect(screen.queryByRole("link", { name: "Mulai membaca" })).not.toBeInTheDocument();
  });

  it("menampilkan jumlah penanda tersimpan", async () => {
    await addBookmark(1, 1);

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("1 penanda tersimpan")).toBeInTheDocument();
  });
});

describe("S07 — Penanda", () => {
  it("menampilkan state kosong", async () => {
    render(
      <MemoryRouter>
        <BookmarksPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Belum ada penanda")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mulai membaca" })).toHaveAttribute("href", "/surah");
  });

  it("menampilkan penanda terbaru lebih dahulu", async () => {
    await addBookmark(1, 1, "2026-11-14T10:00:00.000Z");
    await addBookmark(18, 10, "2026-11-15T10:00:00.000Z");

    render(
      <MemoryRouter>
        <BookmarksPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("QS. Al-Kahf 18:10")).toBeInTheDocument();
    expect(screen.getByText("QS. Al-Faatiha 1:1")).toBeInTheDocument();
    expect(screen.getByText("2 ayat ditandai")).toBeInTheDocument();

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "/surah/18/10");
  });

  it("menghapus penanda dan dapat diurungkan", async () => {
    const user = userEvent.setup();
    await addBookmark(18, 10, "2026-11-15T10:00:00.000Z");

    render(
      <MemoryRouter>
        <BookmarksPage />
      </MemoryRouter>,
    );

    await screen.findByText("QS. Al-Kahf 18:10");
    await user.click(screen.getByRole("button", { name: "Hapus penanda QS. Al-Kahf 18:10" }));

    expect(await screen.findByText("Penanda dihapus.")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText("QS. Al-Kahf 18:10")).not.toBeInTheDocument();
    });
    expect(await db.bookmarks.get([18, 10])).toBeUndefined();

    await user.click(screen.getByRole("button", { name: "Urungkan" }));

    expect(await screen.findByText("QS. Al-Kahf 18:10")).toBeInTheDocument();
    expect(await db.bookmarks.get([18, 10])).toBeDefined();
  });
});
