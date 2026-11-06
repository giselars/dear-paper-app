import { useId } from "react";
import type { CoverScene, TextLayout } from "../domain/cover-scene";
import styles from "./CoverPreview.module.scss";

type CoverArtworkProps = { scene: CoverScene };
export const CoverArtwork = ({ scene }: CoverArtworkProps) => {
  const id = useId();
  const text = (layout: TextLayout, className: string) =>
    layout.lines.length > 0 && (
      <text
        className={className}
        fontSize={layout.fontSize}
        textAnchor="middle"
        xmlSpace="preserve"
      >
        {layout.lines.map((line, index) => (
          <tspan key={index} x={line.x} y={line.y}>
            {line.text}
          </tspan>
        ))}
      </text>
    );
  return (
    <div className={styles.notebook}>
      <div
        className={styles.spine}
        style={{ backgroundColor: scene.spine }}
        aria-hidden="true"
      />
      <svg
        className={styles.cover}
        viewBox={`0 0 ${scene.width} ${scene.height}`}
        role="img"
        aria-labelledby={`${id}-title ${id}-description`}
        style={{ color: scene.ink }}
      >
        <title id={`${id}-title`}>Tu portada</title>
        <desc id={`${id}-description`}>{scene.description}</desc>
        <rect
          width={scene.width}
          height={scene.height}
          fill={scene.background}
        />
        <image
          href={scene.motifAsset}
          width={scene.width}
          height={scene.height}
        />
        <text
          className={styles.topline}
          x="74"
          y={scene.motif === "frame" ? 27 : 19.6}
          textAnchor="middle"
        >
          CUADERNO DE IDEAS
        </text>
        {text(scene.title, styles.title)}
        {!!scene.title.lines.length && !!scene.subtitle.lines.length && (
          <path
            d={scene.motif === "dunes" ? "M66 108h16" : "M66 121h16"}
            stroke={scene.separator}
            strokeWidth="0.9"
          />
        )}
        {text(scene.subtitle, styles.subtitle)}
      </svg>
    </div>
  );
};
