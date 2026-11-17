export type Revelation = "Meccan" | "Medinan";
export type RevelationLabel = "Makkiyah" | "Madaniyah";

export interface Surah {
  n: number;
  name: string;
  nameLatin: string;
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
    translation: SourceInfo;
  };
  copyrightNotice: string;
  textPolicy: string;
}
