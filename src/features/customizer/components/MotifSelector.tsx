import { getPalette, paletteAsset, type PaletteId } from "../domain/palettes";
import Image from "next/image";
import { compositions } from "../domain/initial-cover";
import styles from "./MotifSelector.module.scss";

import type { CompositionId } from "../domain/configuration";

type MotifSelectorProps = {
  value: CompositionId;
  paletteId: PaletteId;
  disabled: boolean;
  onChange: (value: CompositionId) => void;
};
export const MotifSelector = ({
  value,
  paletteId,
  disabled,
  onChange,
}: MotifSelectorProps) => (
  <fieldset className={styles.fieldset} disabled={disabled}>
    <legend>
      01&nbsp; Motivo ·{" "}
      {compositions.find((option) => option.id === value)?.label}
    </legend>
    <div className={styles.options}>
      {compositions.map(({ id, label }) => (
        <label className={styles.option} key={id}>
          <input
            type="radio"
            name="composition"
            value={id}
            checked={id === value}
            onChange={() => onChange(id)}
          />
          <span className={styles.card}>
            <span
              className={styles.thumbnail}
              style={{ backgroundColor: getPalette(paletteId).background }}
            >
              <Image
                className={styles.thumbnailImage}
                data-composition={id}
                src={paletteAsset("thumbnails", id, paletteId)}
                fill
                sizes="(max-width: 767px) 33vw, 120px"
                alt=""
              />
            </span>
            <span className={styles.name}>
              {id === value && <span aria-hidden="true">✓&nbsp; </span>}
              {label}
            </span>
          </span>
        </label>
      ))}
    </div>
  </fieldset>
);
