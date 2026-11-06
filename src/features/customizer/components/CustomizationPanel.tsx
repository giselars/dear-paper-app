import { MotifSelector } from "./MotifSelector";
import { PalettePicker } from "./PalettePicker";
import { CoverTextFields } from "./CoverTextFields";
import { CustomizerActions } from "./CustomizerActions";
import { TypographySelector } from "./TypographySelector";
import type { CoverConfiguration } from "../domain/configuration";
import type { ConfigurationChange } from "../domain/customizer-reducer";
import styles from "./CustomizationPanel.module.scss";

type CustomizationPanelProps = {
  configuration: CoverConfiguration;
  resetRevision: number;
  ready: boolean;
  change: (change: ConfigurationChange) => void;
  reset: () => void;
  colorNotice: string | null;
  onShare: () => void;
};

export const CustomizationPanel = ({
  configuration,
  resetRevision,
  ready,
  change,
  reset,
  colorNotice,
  onShare,
}: CustomizationPanelProps) => (
  <section
    className={styles.panel}
    aria-labelledby="panel-title"
    aria-describedby="availability-note"
  >
    <div className={styles.heading}>
      <h2 id="panel-title">Dale tu toque.</h2>
      <button
        type="button"
        className={styles.reset}
        disabled={!ready}
        onClick={reset}
      >
        Restablecer
      </button>
    </div>
    <MotifSelector
      paletteId={configuration.paletteId}
      value={configuration.compositionId}
      disabled={!ready}
      onChange={(value) => change({ field: "compositionId", value })}
    />
    <PalettePicker
      value={configuration.paletteId}
      disabled={!ready}
      onChange={(value) => change({ field: "paletteId", value })}
    />
    <CoverTextFields
      key={resetRevision}
      configuration={configuration}
      disabled={!ready}
      onChange={(field, value) => change({ field, value })}
    />
    <div className={styles.selectors}>
      <TypographySelector disabled={!ready} />
    </div>
    <p
      className={colorNotice ? styles.availability : styles.silentNotice}
      role="status"
      aria-atomic="true"
    >
      {colorNotice}
    </p>
    <CustomizerActions ready={ready} onShare={onShare} />
    <p className={styles.availability} id="availability-note">
      Conserva el enlace para volver a abrir este diseño. Los cambios
      posteriores necesitan un nuevo enlace.
    </p>
  </section>
);
