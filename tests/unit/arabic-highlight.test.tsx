import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArabicText } from "@/components/quran/ArabicText";
import { findHighlightRanges } from "@/lib/search/normalize";

const TEXT = "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ";

describe("ArabicText dengan sorotan", () => {
  it("tidak mengubah isi teks saat menyorot", () => {
    const ranges = findHighlightRanges(TEXT, "الرحمن");
    const { container } = render(<ArabicText text={TEXT} highlightRanges={ranges} />);
    const element = container.querySelector("p");

    expect(element?.textContent).toBe(TEXT);
    expect(element).toHaveAttribute("dir", "rtl");
    expect(element).toHaveAttribute("lang", "ar");
    expect(element?.querySelector("mark")?.textContent).toBe(
      TEXT.slice(ranges[0]!.start, ranges[0]!.end),
    );
  });

  it("tetap menampilkan teks utuh tanpa sorotan", () => {
    const { container } = render(<ArabicText text={TEXT} />);
    const element = container.querySelector("p");

    expect(element?.textContent).toBe(TEXT);
    expect(element?.querySelector("mark")).toBeNull();
  });

  it("menggabungkan rentang yang bertumpuk tanpa menggandakan teks", () => {
    const { container } = render(
      <ArabicText
        text={TEXT}
        highlightRanges={[
          { start: 0, end: 4 },
          { start: 2, end: 8 },
        ]}
      />,
    );

    expect(container.querySelector("p")?.textContent).toBe(TEXT);
    expect(container.querySelector("mark")?.textContent).toBe(TEXT.slice(0, 8));
  });
});
