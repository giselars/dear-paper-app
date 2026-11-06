import { useEffect, useRef, useState } from "react";
import type { CoverConfiguration } from "../domain/configuration";
import { createDesignLink } from "../domain/design-links";
import { copyDesignLink } from "../adapters/browser-sharing";
import styles from "./CustomizerActions.module.scss";

type ShareState = {
  status: "idle" | "copying" | "copied" | "manual" | "error";
  url: string;
};
type CopyDesignLinkProps = {
  configuration: CoverConfiguration;
  ready: boolean;
};
export const CopyDesignLink = ({
  configuration,
  ready,
}: CopyDesignLinkProps) => {
  const [share, setShare] = useState<ShareState>({ status: "idle", url: "" });
  const input = useRef<HTMLInputElement>(null);
  const operation = useRef(0);
  useEffect(
    () => () => {
      operation.current += 1;
    },
    [],
  );
  useEffect(() => {
    if (share.status === "manual") {
      input.current?.focus();
      input.current?.select();
    }
  }, [share]);
  const shareDesign = async () => {
    const currentOperation = ++operation.current;
    let url: string;
    try {
      url = createDesignLink(configuration, window.location.href);
    } catch {
      setShare({ status: "error", url: "" });
      return;
    }
    setShare({ status: "copying", url });
    try {
      await copyDesignLink(url);
      if (operation.current === currentOperation)
        setShare({ status: "copied", url });
    } catch {
      if (operation.current === currentOperation)
        setShare({ status: "manual", url });
    }
  };
  return (
    <div className={styles.actions}>
      <button
        className={styles.share}
        type="button"
        disabled={!ready || share.status === "copying"}
        onClick={shareDesign}
        aria-busy={share.status === "copying"}
      >
        <span className={styles.linkIcon} aria-hidden="true" />
        {share.status === "copying" ? "Copiando enlace…" : "Copiar enlace"}
      </button>
      <p role="status" aria-atomic="true">
        {share.status === "copied" && "Enlace copiado."}
        {share.status === "manual" &&
          "No se pudo copiar automáticamente. Copia el enlace del campo siguiente."}
        {share.status === "error" &&
          "No se pudo crear el enlace. Vuelve a intentarlo."}
      </p>
      {share.status === "manual" && (
        <label className={styles.manual}>
          Enlace de tu diseño
          <input
            ref={input}
            type="url"
            readOnly
            value={share.url}
            onFocus={(event) => event.currentTarget.select()}
          />
        </label>
      )}
      <p>Este enlace incluye los textos y la información de tu diseño.</p>
    </div>
  );
};
