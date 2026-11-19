import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { initInstall, promptInstall, resetInstall } from "@/features/pwa/install";

function fireInstallPrompt(outcome: "accepted" | "dismissed" = "accepted") {
  const prompt = vi.fn().mockResolvedValue(undefined);
  const event = Object.assign(new Event("beforeinstallprompt", { cancelable: true }), {
    prompt,
    userChoice: Promise.resolve({ outcome }),
  });
  window.dispatchEvent(event);
  return { prompt, event };
}

beforeEach(() => {
  resetInstall();
  initInstall();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("InstallPrompt", () => {
  it("tidak tampil sebelum peramban menawarkan pemasangan", () => {
    const { container } = render(<InstallPrompt show />);

    expect(container).toBeEmptyDOMElement();
  });

  it("tidak tampil bila belum waktunya atau sedang tidak diminta", async () => {
    fireInstallPrompt();
    const { container } = render(<InstallPrompt show={false} />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText(/Pasang Quranku di layar utama/)).not.toBeInTheDocument();
  });

  it("menahan prompt bawaan lalu memasang saat tombol ditekan", async () => {
    const user = userEvent.setup();
    const { prompt, event } = fireInstallPrompt();
    render(<InstallPrompt show />);

    expect(event.defaultPrevented).toBe(true);
    await user.click(await screen.findByRole("button", { name: "Pasang" }));

    expect(prompt).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "Pasang" })).not.toBeInTheDocument();
  });

  it("mengingat pilihan Nanti dan tidak menampilkannya lagi", async () => {
    const user = userEvent.setup();
    fireInstallPrompt();
    render(<InstallPrompt show />);

    await user.click(await screen.findByRole("button", { name: "Tutup ajakan pasang" }));

    expect(window.localStorage.getItem("quranku.install.dismissedUntil")).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Pasang" })).not.toBeInTheDocument();
  });

  it("tetap tersembunyi saat berjalan sebagai aplikasi terpasang", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: query === "(display-mode: standalone)",
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList,
    );
    fireInstallPrompt();

    const { container } = render(<InstallPrompt show />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe("promptInstall", () => {
  it("mengembalikan unavailable tanpa peristiwa pemasangan", async () => {
    await expect(promptInstall()).resolves.toBe("unavailable");
  });

  it("mengembalikan outcome yang dipilih pengguna", async () => {
    fireInstallPrompt("dismissed");

    await expect(promptInstall()).resolves.toBe("dismissed");
  });
});
