import { SearchX } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/StateView";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import styles from "./NotFoundPage.module.css";

export function NotFoundPage() {
  useDocumentTitle("Halaman tidak ditemukan");

  return (
    <PageContainer>
      <h1 className="sr-only">Halaman tidak ditemukan</h1>
      <EmptyState
        icon={SearchX}
        title="Halaman tidak ditemukan"
        description="Alamat yang Anda buka tidak tersedia atau sudah dipindahkan."
        action={<ButtonLink to="/">Kembali ke beranda</ButtonLink>}
      />
      <p className={styles.help}>
        Anda juga dapat membuka <a href="/surah">indeks surah</a>.
      </p>
    </PageContainer>
  );
}
