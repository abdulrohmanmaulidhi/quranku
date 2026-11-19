import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearDataCache } from "@/lib/data/client";
import { db } from "@/lib/db/db";
import { ReaderPage } from "@/pages/ReaderPage";
import { readDataFileForUrl, readSurahText } from "./helpers";

vi.mock("@/lib/useDocumentTitle", () => ({
  useDocumentTitle: () => undefined,
}));

const kahf = readSurahText(18);

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

function renderReader(initialEntry: string) {
  const router = createMemoryRouter([{ path: "/surah/:surah/:ayah?", element: <ReaderPage /> }], {
    initialEntries: [initialEntry],
  });
  return render(<RouterProvider router={router} />);
}

beforeEach(async () => {
  clearDataCache();
  installDataFetch();
  await Promise.all([db.bookmarks.clear(), db.position.clear(), db.settings.clear()]);
});

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(navigator, "share");
});

describe("S03 — Reader", () => {
  it("menampilkan teks Arab ayat persis dari data", async () => {
    renderReader("/surah/18");

    expect(await screen.findByRole("heading", { level: 1, name: "Al-Kahf" })).toBeInTheDocument();
    const source = kahf.ayahs[0]?.text ?? "";
    const words = source.split(" ");
    const basmalah = document.querySelector("[data-basmalah]");
    const target = document.querySelector("#ayah-1 [dir='rtl']");

    expect(basmalah?.textContent).toBe(words.slice(0, 4).join(" "));
    expect(basmalah?.previousElementSibling).toBe(
      screen.getByText("Ketuk ayat untuk membuka aksi."),
    );
    expect(target?.textContent).toBe(words.slice(4).join(" "));
    expect(`${basmalah?.textContent} ${target?.textContent}`).toBe(source);
    expect(target).toHaveAttribute("lang", "ar");
    expect(screen.getByText("Makkiyah · 110 ayat")).toBeInTheDocument();
  });

  it("tidak memisah basmalah pada surah 1", async () => {
    renderReader("/surah/1");

    expect(
      await screen.findByRole("heading", { level: 1, name: "Al-Faatiha" }),
    ).toBeInTheDocument();
    expect(document.querySelector("[data-basmalah]")).toBeNull();
    expect(document.querySelector("#ayah-1 [dir='rtl']")?.textContent).toBe(
      readSurahText(1).ayahs[0]?.text,
    );
  });

  it("membuka deep link ayat dan menandainya sebagai ayat dituju", async () => {
    renderReader("/surah/18/10");

    expect(await screen.findByText("Ayat dituju")).toBeInTheDocument();
    const target = document.querySelector("#ayah-10 [dir='rtl']");
    expect(target?.textContent).toBe(kahf.ayahs[9]?.text);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("mendukung format ?ayah= pada URL", async () => {
    renderReader("/surah/18?ayah=10");

    expect(await screen.findByText("Ayat dituju")).toBeInTheDocument();
    expect(document.querySelector("#ayah-10")).not.toBeNull();
  });

  it("memberi tahu bila nomor ayat di luar rentang dan bisa ditutup", async () => {
    const user = userEvent.setup();
    renderReader("/surah/18/999");

    const notice = await screen.findByText(
      "Ayat 999 tidak ditemukan. Surah ini memiliki 110 ayat.",
    );
    expect(notice).toBeInTheDocument();
    expect(screen.queryByText("Ayat dituju")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tutup" }));
    expect(
      screen.queryByText("Ayat 999 tidak ditemukan. Surah ini memiliki 110 ayat."),
    ).not.toBeInTheDocument();
  });

  it("menampilkan aksi ayat lewat penanda ayat", async () => {
    const user = userEvent.setup();
    renderReader("/surah/18");

    await screen.findByRole("heading", { level: 1, name: "Al-Kahf" });
    await user.click(screen.getByRole("button", { name: "Pilih ayat 10" }));

    expect(screen.getByText("Aksi ayat 10")).toBeInTheDocument();
    const menuButton = screen.getByRole("button", { name: "Aksi ayat 10" });
    expect(menuButton).toHaveAttribute("aria-expanded", "false");

    await user.click(menuButton);
    expect(screen.getByRole("button", { name: "Salin referensi" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salin ayat" })).toBeInTheDocument();
  });

  it("membagikan ayat dengan teks Arab verbatim bila Web Share API tersedia", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { configurable: true, value: share });

    const user = userEvent.setup();
    renderReader("/surah/18/10");

    await screen.findByText("Ayat dituju");
    await user.click(screen.getByRole("button", { name: "Pilih ayat 10" }));
    await user.click(screen.getByRole("button", { name: "Aksi ayat 10" }));
    await user.click(screen.getByRole("button", { name: "Bagikan ayat" }));

    await waitFor(() => {
      expect(share).toHaveBeenCalledTimes(1);
    });
    const data = share.mock.calls[0]?.[0] as ShareData;
    expect(data.text).toContain(kahf.ayahs[9]!.text);
    expect(data.text).toContain("QS. Al-Kahf 18:10");
    expect(data.url).toMatch(/\/surah\/18\/10$/);
  });

  it("menambah penanda, menghapus, dan memulihkannya", async () => {
    const user = userEvent.setup();
    renderReader("/surah/18");

    await screen.findByRole("heading", { level: 1, name: "Al-Kahf" });
    await user.click(screen.getByRole("button", { name: "Pilih ayat 10" }));
    await user.click(screen.getByRole("button", { name: "Aksi ayat 10" }));
    await user.click(screen.getByRole("button", { name: "Beri penanda" }));

    expect(await screen.findByText("Penanda ditambahkan.")).toBeInTheDocument();
    await waitFor(async () => {
      expect(await db.bookmarks.get([18, 10])).toBeDefined();
    });

    await user.click(screen.getByRole("button", { name: "Aksi ayat 10" }));
    expect(await screen.findByRole("button", { name: "Hapus penanda" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Hapus penanda" }));

    expect(await screen.findByText("Penanda dihapus.")).toBeInTheDocument();
    await waitFor(async () => {
      expect(await db.bookmarks.get([18, 10])).toBeUndefined();
    });

    await user.click(screen.getByRole("button", { name: "Urungkan" }));
    await waitFor(async () => {
      expect(await db.bookmarks.get([18, 10])).toBeDefined();
    });
  });

  it("menampilkan error untuk nomor surah yang tidak valid", async () => {
    renderReader("/surah/999");

    expect(await screen.findByText("Surah tidak ditemukan.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kembali ke indeks" })).toBeInTheDocument();
  });
});
