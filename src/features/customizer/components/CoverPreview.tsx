import type { Ref } from "react";
import type { CoverScene } from "../domain/cover-scene";
import { CoverArtwork } from "./CoverArtwork";
import styles from "./CoverPreview.module.scss";

type CoverPreviewProps = {
  scene: CoverScene | null;
  ready: boolean;
  previewRef: Ref<HTMLElement>;
  hiddenFromAT?: boolean;
};
export const CoverPreview = ({
  scene,
  ready,
  previewRef,
  hiddenFromAT,
}: CoverPreviewProps) => (
  <figure
    ref={previewRef}
    className={styles.workspace}
    aria-labelledby="preview-label"
    aria-busy={!ready}
    aria-hidden={hiddenFromAT || undefined}
  >
    <div className={styles.caption}>
      <span id="preview-label" className={styles.eyebrow}>
        Tu portada
      </span>
      <span>A5 · 148 × 210 mm</span>
    </div>
    {scene && <CoverArtwork scene={scene} />}
    <figcaption className={styles.disclaimer}>Vista previa</figcaption>
  </figure>
);
