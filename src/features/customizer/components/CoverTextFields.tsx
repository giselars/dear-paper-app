import { TextField } from "@/components/ui/TextField";
import {
  textLimits,
  validateCoverText,
  type CoverConfiguration,
  type TextFieldName,
} from "../domain/configuration";
import styles from "./CoverTextFields.module.scss";

type CoverTextFieldsProps = {
  configuration: CoverConfiguration;
  disabled: boolean;
  onChange: (field: TextFieldName, value: string) => void;
};
export const CoverTextFields = ({
  configuration,
  disabled,
  onChange,
}: CoverTextFieldsProps) => (
  <section
    className={styles.fields}
    aria-labelledby="words-label"
    id="tus-palabras"
  >
    <h3 id="words-label">03&nbsp; Tus palabras</h3>
    <TextField
      id="cover-title-input"
      label="Título"
      value={configuration.title}
      limit={textLimits.title}
      disabled={disabled}
      validate={(value) => validateCoverText(value, "title")}
      onValueChange={(value) => onChange("title", value)}
    />
    <TextField
      id="cover-subtitle-input"
      label="Subtítulo"
      value={configuration.subtitle}
      limit={textLimits.subtitle}
      disabled={disabled}
      validate={(value) => validateCoverText(value, "subtitle")}
      onValueChange={(value) => onChange("subtitle", value)}
    />
  </section>
);
