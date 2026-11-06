import styles from "./CustomizationPanel.module.scss";

type TypographySelectorProps = { disabled: boolean };
export const TypographySelector = ({ disabled }: TypographySelectorProps) => (
  <label className={styles.selectField} htmlFor="typography">
    Tipografía
    <select id="typography" defaultValue="literary" disabled={disabled}>
      <option value="literary">Literaria</option>
    </select>
  </label>
);
