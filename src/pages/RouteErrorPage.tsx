import { PageContainer } from "@/components/layout/PageContainer";
import { ButtonLink } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/StateView";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import styles from "./RouteErrorPage.module.css";

export function RouteErrorPage() {
  useDocumentTitle("Terjadi kesalahan");

  return (
    <main className={styles.page}>
      <PageContainer>
        <ErrorState
          title="Halaman tidak dapat dibuka."
          description="Muat ulang halaman atau kembali ke beranda."
          action={<ButtonLink to="/">Kembali ke beranda</ButtonLink>}
        />
      </PageContainer>
    </main>
  );
}
