import { useRef } from "react";
import type { CoverScene } from "../domain/cover-scene";
import { CoverArtwork } from "./CoverArtwork";
import styles from "./MobileCoverPreview.module.scss";

type MobileCoverPreviewProps = { scene: CoverScene; keyboardOpen: boolean };
export const MobileCoverPreview = ({
  scene,
  keyboardOpen,
}: MobileCoverPreviewProps) => {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <aside
        className={styles.compact}
        data-keyboard={keyboardOpen || undefined}
        aria-label="Vista previa de tu portada"
      >
        {!keyboardOpen && <CoverArtwork scene={scene} />}
        <div className={styles.tools}>
          {!keyboardOpen && (
            <>
              <p className={styles.label}>Tu portada · A5</p>
              <p>Los cambios se ven aquí.</p>
            </>
          )}
          <button type="button" onClick={() => dialog.current?.showModal()}>
            {keyboardOpen ? "Ver portada" : "↗ Ampliar portada"}
          </button>
          <a href="#panel-title">Motivo y color ↑</a>
        </div>
      </aside>
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby="expanded-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className={styles.dialogContent}>
          <div className={styles.dialogHeading}>
            <h2 id="expanded-title">Tu portada</h2>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              autoFocus
            >
              Cerrar
            </button>
          </div>
          <CoverArtwork scene={scene} />
          <p>Vista previa</p>
        </div>
      </dialog>
    </>
  );
};
