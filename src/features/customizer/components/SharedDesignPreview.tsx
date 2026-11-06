import { useEffect, useRef } from "react";
import type { CoverSnapshot } from "../domain/design-links";
import type { CoverScene } from "../domain/cover-scene";
import { CoverArtwork } from "./CoverArtwork";
import { CopyDesignLink } from "./CopyDesignLink";
import styles from "./SharedDesignPreview.module.scss";

type SharedDesignPreviewProps = {
  scene: CoverScene;
  configuration: CoverSnapshot;
  onReturn?: () => void;
};

export const SharedDesignPreview = ({
  scene,
  configuration,
  onReturn,
}: SharedDesignPreviewProps) => {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (onReturn) {
      heading.current?.focus();
      window.scrollTo(0, 0);
    }
  }, [onReturn]);
  return (
    <main
      id="taller"
      className={styles.preview}
      data-received={!onReturn || undefined}
      tabIndex={-1}
    >
      <h1 ref={heading} tabIndex={-1} className={styles.heading}>
        {onReturn ? (
          <>
            <span className={styles.desktop}>
              Tu diseño,
              <br />
              listo para compartir.
            </span>
            <span className={styles.mobile}>
              Tu diseño, listo para compartir.
            </span>
          </>
        ) : (
          <>
            <span className={styles.desktop}>
              Vista previa
              <br />
              de la portada
            </span>
            <span className={styles.mobile}>Vista previa de la portada</span>
          </>
        )}
      </h1>
      <figure
        className={styles.workspace}
        aria-label={onReturn ? "Tu portada" : "Vista previa de la portada"}
      >
        {onReturn && <p className={styles.eyebrow}>Tu portada</p>}
        <CoverArtwork scene={scene} />
        <figcaption>Vista previa</figcaption>
      </figure>
      <p className={styles.description}>
        {onReturn ? (
          <>
            <span className={styles.desktop}>
              Así se verá tu portada al abrir el enlace. Se comparte esta
              versión de tu diseño.
            </span>
            <span className={styles.mobile}>
              Así se verá al abrir el enlace. Se comparte esta versión de tu
              diseño.
            </span>
          </>
        ) : (
          "Han compartido este diseño contigo."
        )}
      </p>
      {onReturn && "paletteId" in configuration ? (
        <>
          <div className={styles.actions}>
            <CopyDesignLink configuration={configuration} ready />
          </div>
          <button type="button" className={styles.return} onClick={onReturn}>
            <span aria-hidden="true">←&nbsp; </span>Volver al editor
          </button>
        </>
      ) : null}
    </main>
  );
};
