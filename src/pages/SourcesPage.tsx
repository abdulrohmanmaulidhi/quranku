import { ExternalLink } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/StateView";
import { Icon } from "@/components/ui/Icon";
import { useManifest } from "@/features/quran/useQuranData";
import { dataUrl } from "@/lib/data/url";
import { formatDate } from "@/lib/format/date";
import { formatNumber } from "@/lib/format/number";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import styles from "./SourcesPage.module.css";

function ExternalLinkText({ href, children }: { href: string; children: string }) {
  return (
    <a className={styles.external} href={href} target="_blank" rel="noreferrer">
      {children}
      <Icon icon={ExternalLink} size={16} />
    </a>
  );
}

export function SourcesPage() {
  useDocumentTitle("Sumber & Atribusi");
  const manifest = useManifest();

  return (
    <>
      <TopBar title="Sumber & Atribusi" backTo="/pengaturan" />
      <PageContainer>
        <h1 className="sr-only">Sumber &amp; Atribusi</h1>

        {manifest.status === "loading" ? (
          <div className={styles.loading} aria-hidden="true">
            <Skeleton width="10rem" height="1.5rem" />
            <Skeleton width="100%" height="6rem" radius="md" />
            <Skeleton width="8rem" height="1.5rem" />
            <Skeleton width="100%" height="5rem" radius="md" />
          </div>
        ) : null}

        {manifest.status === "error" ? (
          <ErrorState
            title="Informasi sumber belum dapat dimuat."
            description="Coba lagi untuk menampilkan atribusi dan versi data."
            action={
              <Button variant="primary" onClick={manifest.retry}>
                Coba lagi
              </Button>
            }
          />
        ) : null}

        {manifest.status === "success" ? (
          <div className={styles.content}>
            <p className={styles.lead}>
              Quranku menampilkan teks Al-Qur&apos;an tanpa perubahan. Data pengguna tidak dikirim
              ke server mana pun.
            </p>

            <section className={styles.section} aria-labelledby="quran-source-heading">
              <h2 id="quran-source-heading" className={styles.heading}>
                Teks Al-Qur&apos;an
              </h2>
              <p className={styles.paragraph}>
                Teks Al-Qur&apos;an (Uthmani) bersumber dari paket Hafs 20 yang disediakan{" "}
                <ExternalLinkText href="https://quranenc.com/en/home">
                  QuranEnc.com
                </ExternalLinkText>
                , yaitu teks Uthmani Hafs versi {manifest.data.source.text.version} dari King Fahd
                Glorious Quran Printing Complex (KFGQPC). Teks ditampilkan tanpa perubahan.
              </p>
              <dl className={styles.details}>
                <div className={styles.detailRow}>
                  <dt>Sumber</dt>
                  <dd>{manifest.data.source.text.name}</dd>
                </div>
                <div className={styles.detailRow}>
                  <dt>Versi</dt>
                  <dd>{manifest.data.source.text.version}</dd>
                </div>
                <div className={styles.detailRow}>
                  <dt>Lisensi</dt>
                  <dd>{manifest.data.source.text.license}</dd>
                </div>
                <div className={styles.detailRow}>
                  <dt>Diunduh</dt>
                  <dd>
                    {formatDate(new Date(`${manifest.data.source.text.retrievedAt}T12:00:00Z`))}
                  </dd>
                </div>
              </dl>
              <p className={styles.links}>
                <ExternalLinkText href={manifest.data.source.text.url}>Hafs 20</ExternalLinkText>
                <a
                  className={styles.external}
                  href={dataUrl("COPYRIGHT.txt")}
                  target="_blank"
                  rel="noreferrer"
                >
                  Berkas hak cipta
                  <Icon icon={ExternalLink} size={16} />
                </a>
              </p>
              <p className={styles.note}>{manifest.data.textPolicy}</p>
            </section>

            <section className={styles.section} aria-labelledby="metadata-heading">
              <h2 id="metadata-heading" className={styles.heading}>
                Metadata surah dan juz
              </h2>
              <p className={styles.paragraph}>
                Nama surah, jumlah ayat, klasifikasi Makkiyah/Madaniyah, dan batas juz diambil dari{" "}
                {manifest.data.source.metadata.name} versi {manifest.data.source.metadata.version}.
                Nama surah Latin memakai{" "}
                <ExternalLinkText href={manifest.data.source.names.url}>
                  QuranEnc.com
                </ExternalLinkText>
                , dengan diakritik dihilangkan agar mudah dibaca di antarmuka. Data ini tidak
                mengubah teks ayat.
              </p>
            </section>

            <section className={styles.section} aria-labelledby="font-heading">
              <h2 id="font-heading" className={styles.heading}>
                Font
              </h2>
              <ul className={styles.fontList}>
                <li>
                  <span className={styles.fontName}>Inter</span> — antarmuka. Lisensi SIL Open Font
                  License.{" "}
                  <a className={styles.external} href="/fonts/licenses/Inter-OFL.txt">
                    Berkas lisensi
                  </a>
                </li>
                <li>
                  <span className={styles.fontName}>Hafs 20</span> — teks Arab. Font Uthmani Hafs
                  v20 dari King Fahd Glorious Quran Printing Complex (KFGQPC), dipakai bersama teks
                  yang cocok. Lisensi KFGQPC mengizinkan pemakaian dan distribusi tanpa perubahan.{" "}
                  <a className={styles.external} href="/fonts/licenses/KFGQPC-Hafs.txt">
                    Berkas lisensi
                  </a>
                </li>
              </ul>
              <p className={styles.note}>
                Teks dan font Hafs 20 dipakai berpasangan; font ini tidak diubah atau di-subset
                sesuai lisensinya.
              </p>
            </section>

            <section className={styles.section} aria-labelledby="translation-heading">
              <h2 id="translation-heading" className={styles.heading}>
                Terjemahan
              </h2>
              <p className={styles.paragraph}>
                Terjemahan Indonesia disediakan oleh Kementerian Agama Republik Indonesia melalui{" "}
                <ExternalLinkText href={manifest.data.source.translation.url}>
                  QuranEnc.com
                </ExternalLinkText>
                , versi {manifest.data.source.translation.version}. Teks dan catatan kaki
                ditampilkan tanpa perubahan; penanda catatan kaki dipertahankan.
              </p>
              <dl className={styles.details}>
                <div className={styles.detailRow}>
                  <dt>Sumber</dt>
                  <dd>{manifest.data.source.translation.name}</dd>
                </div>
                <div className={styles.detailRow}>
                  <dt>Versi</dt>
                  <dd>{manifest.data.source.translation.version}</dd>
                </div>
                <div className={styles.detailRow}>
                  <dt>Lisensi</dt>
                  <dd>{manifest.data.source.translation.license}</dd>
                </div>
                <div className={styles.detailRow}>
                  <dt>Diunduh</dt>
                  <dd>
                    {formatDate(
                      new Date(`${manifest.data.source.translation.retrievedAt}T12:00:00Z`),
                    )}
                  </dd>
                </div>
              </dl>
              <p className={styles.links}>
                <a
                  className={styles.external}
                  href={dataUrl("tr/indonesian_affairs/SOURCE.txt")}
                  target="_blank"
                  rel="noreferrer"
                >
                  Syarat pemakaian dan rincian sumber
                  <Icon icon={ExternalLink} size={16} />
                </a>
              </p>
              <p className={styles.note}>
                Terjemahan bukan Al-Qur&apos;an itu sendiri. Catatan tentang terjemahan dilaporkan
                ke QuranEnc, tidak diubah di aplikasi ini. Aplikasi tidak menampilkan terjemahan
                yang dihasilkan AI.
              </p>
            </section>

            <section className={styles.section} aria-labelledby="data-heading">
              <h2 id="data-heading" className={styles.heading}>
                Versi data
              </h2>
              <p className={styles.paragraph}>
                Dataset versi {manifest.data.datasetVersion} ·{" "}
                {formatNumber(manifest.data.counts.surahs)} surah ·{" "}
                {formatNumber(manifest.data.counts.ayahs)} ayat ·{" "}
                {formatNumber(manifest.data.counts.juz)} juz.
              </p>
              <details className={styles.technical}>
                <summary>Rincian teknis</summary>
                <dl className={styles.details}>
                  <div className={styles.detailRow}>
                    <dt>Skema</dt>
                    <dd>{manifest.data.schemaVersion}</dd>
                  </div>
                  <div className={styles.detailRow}>
                    <dt>SHA-256 teks</dt>
                    <dd>
                      <code>{manifest.data.source.text.sha256}</code>
                    </dd>
                  </div>
                  <div className={styles.detailRow}>
                    <dt>SHA-256 metadata</dt>
                    <dd>
                      <code>{manifest.data.source.metadata.sha256}</code>
                    </dd>
                  </div>
                  <div className={styles.detailRow}>
                    <dt>SHA-256 terjemahan</dt>
                    <dd>
                      <code>{manifest.data.source.translation.sha256}</code>
                    </dd>
                  </div>
                </dl>
              </details>
            </section>

            <section className={styles.section} aria-labelledby="privacy-heading">
              <h2 id="privacy-heading" className={styles.heading}>
                Privasi
              </h2>
              <p className={styles.paragraph}>
                Penanda, posisi terakhir, dan pengaturan disimpan hanya di perangkat ini. Quranku
                tidak memiliki akun, tidak menampilkan iklan, dan tidak mengirim riwayat bacaan ke
                server.
              </p>
            </section>
          </div>
        ) : null}
      </PageContainer>
    </>
  );
}
