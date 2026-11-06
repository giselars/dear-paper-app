import { palettes, type PaletteId } from "../domain/palettes";
import styles from "./PalettePicker.module.scss";

type PalettePickerProps = {
  value: PaletteId;
  disabled: boolean;
  onChange: (value: PaletteId) => void;
};
export const PalettePicker = ({
  value,
  disabled,
  onChange,
}: PalettePickerProps) => (
  <fieldset className={styles.fieldset} disabled={disabled}>
    <legend>
      02&nbsp; Paleta ·{" "}
      {palettes.find((palette) => palette.id === value)?.label}
    </legend>
    <div className={styles.options}>
      {palettes.map((palette) => (
        <label className={styles.option} key={palette.id}>
          <input
            type="radio"
            name="palette"
            value={palette.id}
            aria-label={palette.label}
            checked={value === palette.id}
            onChange={() => onChange(palette.id)}
          />
          <span
            className={styles.swatch}
            style={{
              background: `linear-gradient(to right, ${palette.background} 50%, ${palette.accent} 50%)`,
            }}
          >
            {value === palette.id && (
              <span
                className={styles.check}
                style={{ color: palette.accent }}
                aria-hidden="true"
              >
                ✓
              </span>
            )}
          </span>
        </label>
      ))}
    </div>
  </fieldset>
);
