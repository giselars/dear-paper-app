import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Customizer } from "@/features/customizer/components/Customizer";
import { EditorStartup } from "@/features/customizer/components/EditorStartup";
import styles from "./page.module.scss";

export default function Home() {
  return (
    <EditorStartup>
      <div className={styles.page}>
        <a className={styles.skipLink} href="#taller">
          Saltar al taller
        </a>
        <SiteHeader />
        <Customizer
          footer={<SiteFooter />}
          introduction={
            <section
              className={styles.introduction}
              aria-labelledby="page-title"
            >
              <div className={styles.promise}>
                <h1 id="page-title">Un lugar para tus próximas ideas.</h1>
                <p className={styles.desktopDescription}>
                  Haz tuya una libreta. Elige una composición, encuentra tu
                  color y ponle palabras.
                </p>
                <p className={styles.mobileDescription}>
                  Elige un motivo, encuentra tu color y ponle palabras.
                </p>
              </div>
              <span className={styles.previewStatus}>
                Vista previa del taller
              </span>
            </section>
          }
        />
      </div>
    </EditorStartup>
  );
}
