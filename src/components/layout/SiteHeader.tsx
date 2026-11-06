import { ProjectDialog } from "@/features/project/components/ProjectDialog";
import Image from "next/image";
import Link from "next/link";
import styles from "./SiteHeader.module.scss";

export const SiteHeader = ({
  introduction = true,
}: {
  introduction?: boolean;
}) => (
  <header className={styles.header}>
    <Link className={styles.brand} href="/" aria-label="Dear Paper, inicio">
      <Image
        src="/assets/brand/wordmark.svg"
        alt="Dear Paper"
        width={194}
        height={39}
        preload
      />
    </Link>
    <p className={styles.descriptor}>Un pequeño taller digital</p>
    <ProjectDialog
      triggerClassName={styles.about}
      introduction={introduction}
    />
  </header>
);
