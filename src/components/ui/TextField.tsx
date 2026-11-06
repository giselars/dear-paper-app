import { useRef, useState } from "react";
import styles from "./TextField.module.scss";

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  limit: number;
  disabled?: boolean;
  validate: (value: string) => string | undefined;
  onValueChange: (value: string) => void;
};

export const TextField = ({
  id,
  label,
  value,
  limit,
  disabled = false,
  validate,
  onValueChange,
}: TextFieldProps) => {
  // Only the unfinished input is local. The preview uses the last valid configuration.
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string>();
  const composing = useRef(false);
  const commit = (candidate: string) => {
    const issue = validate(candidate);
    setError(issue);
    if (!issue) onValueChange(candidate);
  };
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={id}>{label}</label>
        <span id={`${id}-count`} className={styles.count}>
          {Array.from(draft).length}/{limit}
        </span>
      </div>
      <input
        id={id}
        type="text"
        value={draft}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={`${id}-count${error ? ` ${id}-error` : ""}`}
        onChange={(event) => {
          const candidate = event.currentTarget.value;
          setDraft(candidate);
          if (!composing.current) commit(candidate);
        }}
        onCompositionStart={() => {
          composing.current = true;
        }}
        onCompositionEnd={(event) => {
          composing.current = false;
          const candidate = event.currentTarget.value;
          setDraft(candidate);
          commit(candidate);
        }}
        onPaste={(event) => {
          const pasted = event.clipboardData.getData("text");
          if (/[\r\n\u2028\u2029\u0000-\u001f]/u.test(pasted)) {
            event.preventDefault();
            setError("Usa texto en una sola línea, sin caracteres de control.");
          }
        }}
      />
      {error && (
        <p className={styles.error} id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
