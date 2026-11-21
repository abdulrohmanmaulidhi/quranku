export type Revelation = "Meccan" | "Medinan";
export type RevelationLabel = "Makkiyah" | "Madaniyah";

export interface Surah {
  n: number;
  name: string;
  nameLatin: string;
  /** Ejaan lain untuk pencarian, mis. nama Tanzil. */
  nameAliases: string[];
  nameEnglish: string;
  revelation: Revelation;
  revelationId: RevelationLabel;
  ayahCount: number;
  order: number;
  rukus: number;
}

export interface AyahRef {
  surah: number;
  ayah: number;
}

export interface Juz {
  juz: number;
  start: AyahRef;
  end: AyahRef;
}

export interface Ayah {
  n: number;
  text: string;
}

export interface SurahText {
  surah: number;
  ayahs: Ayah[];
}

/** Teks basmalah dari 1:1, dipakai sebagai header surah 2–114 kecuali 9. */
export interface Basmalah {
  text: string;
}

export interface TranslationAyah {
  n: number;
  text: string;
  footnotes: string;
}

export interface SurahTranslation {
  surah: number;
  ayahs: TranslationAyah[];
}

export interface SourceInfo {
  file: string;
  name: string;
  version: string;
  license: string;
  url: string;
  retrievedAt: string;
  sha256: string;
}

export interface Manifest {
  schemaVersion: number;
  datasetVersion: string;
  counts: {
    surahs: number;
    ayahs: number;
    juz: number;
  };
  source: {
    text: SourceInfo;
    metadata: SourceInfo;
    names: SourceInfo;
    translation: SourceInfo;
  };
  copyrightNotice: string;
  textPolicy: string;
}
