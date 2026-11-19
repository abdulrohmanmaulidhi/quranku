import { describe, expect, it } from "vitest";
import { expandQueryVariants, variantsForToken } from "@/lib/search/affixes";

describe("penyederhanaan imbuhan untuk pencarian terjemahan", () => {
  it("membuang awalan dan akhiran umum sampai bentuk dasar", () => {
    expect(variantsForToken("kekuasaan")).toContain("kuasa");
    expect(variantsForToken("perbuatan")).toContain("buat");
    expect(variantsForToken("beriman")).toContain("iman");
    expect(variantsForToken("kebaikan")).toContain("baik");
  });

  it("membongkar imbuhan berantai", () => {
    expect(variantsForToken("diketahui")).toContain("tahu");
    expect(variantsForToken("pengetahuan")).toContain("tahu");
  });

  it("memulihkan huruf yang luluh pada awalan meng- dan meny-", () => {
    expect(variantsForToken("menulis")).toContain("tulis");
    expect(variantsForToken("menyembah")).toContain("sembah");
    expect(variantsForToken("mengirim")).toContain("kirim");
  });

  it("tidak memotong kata menjadi akar yang terlalu pendek", () => {
    expect(variantsForToken("mengapa")).not.toContain("apa");
    expect(variantsForToken("iman")).toEqual(["iman"]);
    expect(variantsForToken("doa")).toEqual(["doa"]);
  });

  it("menggabungkan varian seluruh kata dalam kueri tanpa duplikat", () => {
    const variants = expandQueryVariants("kekuasaan allah");
    expect(variants).toContain("kuasa");
    expect(variants).toContain("allah");
    expect(new Set(variants).size).toBe(variants.length);
  });
});
