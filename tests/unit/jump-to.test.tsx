import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { JumpToDialog } from "@/components/quran/JumpToDialog";
import { clearDataCache } from "@/lib/data/client";
import { readDataFileForUrl, readSurahs } from "./helpers";

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

const surahs = readSurahs();

function renderDialog() {
  const onNavigate = vi.fn();
  const onClose = vi.fn();
  render(
    <JumpToDialog surahs={surahs} initialSurah={18} onNavigate={onNavigate} onClose={onClose} />,
  );
  return { onNavigate, onClose };
}

beforeEach(() => {
  clearDataCache();
  installDataFetch();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("S06 — Lompat ke", () => {
  it("membuka awal surah bila nomor ayat dikosongkan", async () => {
    const user = userEvent.setup();
    const { onNavigate, onClose } = renderDialog();

    expect(screen.getByRole("heading", { name: "Lompat ke" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Buka ayat" }));

    expect(onNavigate).toHaveBeenCalledWith(18);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("menolak nomor ayat di luar rentang surah", async () => {
    const user = userEvent.setup();
    const { onNavigate } = renderDialog();

    await user.selectOptions(screen.getByRole("combobox", { name: "Surah" }), "1");
    await user.type(screen.getByRole("spinbutton", { name: "Nomor ayat" }), "99");
    await user.click(screen.getByRole("button", { name: "Buka ayat" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Surah ini memiliki 7 ayat.");
    expect(screen.getByRole("spinbutton", { name: "Nomor ayat" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("membuka surah dan ayat yang dipilih", async () => {
    const user = userEvent.setup();
    const { onNavigate } = renderDialog();

    await user.selectOptions(screen.getByRole("combobox", { name: "Surah" }), "1");
    await user.type(screen.getByRole("spinbutton", { name: "Nomor ayat" }), "2");
    await user.click(screen.getByRole("button", { name: "Buka ayat" }));

    expect(onNavigate).toHaveBeenCalledWith(1, 2);
  });

  it("membuka awal juz dari tab Juz", async () => {
    const user = userEvent.setup();
    const { onNavigate } = renderDialog();

    await user.click(screen.getByRole("tab", { name: "Juz" }));

    const select = await screen.findByRole("combobox", { name: "Juz" });
    await user.selectOptions(select, "30");
    expect(screen.getByText("Mulai QS. An-Naba 78:1.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Buka juz" }));
    expect(onNavigate).toHaveBeenCalledWith(78, 1);
  });

  it("menutup dialog lewat tombol Tutup", async () => {
    const user = userEvent.setup();
    const { onClose } = renderDialog();

    await user.click(screen.getByRole("button", { name: "Tutup" }));
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
