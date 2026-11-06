import { SiteHeader } from "@/components/layout/SiteHeader";
import { EditorStartup } from "@/features/customizer/components/EditorStartup";
import { ReceivedDesign } from "@/features/customizer/components/ReceivedDesign";
import styles from "../page.module.scss";

export const metadata = { title: "Diseño compartido · Dear Paper" };

export default function SharedPage() {
  return (
    <EditorStartup>
      <div className={styles.page}>
        <a className={styles.skipLink} href="#taller">
          Saltar al diseño
        </a>
        <SiteHeader introduction={false} />
        <ReceivedDesign />
      </div>
    </EditorStartup>
  );
}
