import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearDataCache } from "@/lib/data/client";
import { SurahIndexPage } from "@/pages/SurahIndexPage";
import { readDataFileForUrl } from "./helpers";

vi.mock("@/lib/useDocumentTitle", () => ({
  useDocumentTitle: () => undefined,
}));

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

function renderIndex(initialEntry = "/surah") {
  const router = createMemoryRouter([{ path: "/surah", element: <SurahIndexPage /> }], {
    initialEntries: [initialEntry],
  });
  return render(<RouterProvider router={router} />);
}

beforeEach(() => {
  clearDataCache();
  installDataFetch();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("S02 — Indeks Surah", () => {
  it("menampilkan daftar 114 surah setelah data dimuat", async () => {
    renderIndex();

    expect(screen.getByRole("heading", { level: 1, name: "Quran" })).toBeInTheDocument();
    expect(await screen.findByText("Al-Fatihah")).toBeInTheDocument();
    expect(await screen.findByText("114 surah ditemukan.")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("memfilter surah lewat kolom pencarian dan bisa dihapus", async () => {
    const user = userEvent.setup();
    renderIndex();

    await screen.findByText("Al-Fatihah");
    const search = screen.getByRole("searchbox", { name: "Cari surah atau juz" });
    await user.type(search, "kahf");

    expect(await screen.findByText("Al-Kahf")).toBeInTheDocument();
    expect(screen.queryByText("Al-Fatihah")).not.toBeInTheDocument();
    expect(screen.getByText("1 surah ditemukan.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Hapus pencarian" }));
    expect(await screen.findByText("114 surah ditemukan.")).toBeInTheDocument();
  });

  it("menampilkan state kosong untuk pencarian tanpa hasil", async () => {
    const user = userEvent.setup();
    renderIndex();

    await screen.findByText("Al-Fatihah");
    await user.type(screen.getByRole("searchbox"), "surah-yang-tidak-ada");

    expect(await screen.findByText("Tidak ada hasil")).toBeInTheDocument();
    expect(screen.getByText(/Tidak ada surah yang cocok/)).toBeInTheDocument();
  });

  it("berpindah ke tab Juz dan menampilkan 30 juz", async () => {
    const user = userEvent.setup();
    renderIndex();

    await screen.findByText("Al-Fatihah");
    await user.click(screen.getByRole("tab", { name: "Juz" }));

    expect(await screen.findByText("Juz 1")).toBeInTheDocument();
    expect(screen.getByText("Mulai QS. Al-Fatihah 1:1")).toBeInTheDocument();
    expect(screen.getByText("30 juz ditemukan.")).toBeInTheDocument();
    expect(screen.queryByText("Al-Fatihah")).not.toBeInTheDocument();
  });

  it("mempertahankan tab Juz dan kata kunci dari URL", async () => {
    renderIndex("/surah?tab=juz&q=30");

    expect(await screen.findByText("Juz 30")).toBeInTheDocument();
    expect(screen.getByText("1 juz ditemukan.")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Juz" })).toHaveAttribute("aria-selected", "true");
  });
});
