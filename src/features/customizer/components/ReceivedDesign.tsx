"use client";

import { useEffect, useReducer } from "react";
import Link from "next/link";
import { decodeDesignLink, type SharedDesign } from "../domain/design-links";
import { initialCover } from "../domain/initial-cover";
import { useCoverScene } from "../hooks/useCoverScene";
import { useEditorStartup } from "./EditorStartup";
import { SharedDesignPreview } from "./SharedDesignPreview";
import styles from "./ReceivedDesign.module.scss";

export const ReceivedDesign = () => {
  const [design, initialize] = useReducer(
    (_current: SharedDesign | null, next: SharedDesign) => next,
    null,
  );
  useEffect(() => initialize(decodeDesignLink(window.location.search)), []);
  const configuration =
    design?.status === "valid" ? design.configuration : initialCover;
  const { scene, ready, fontError, layoutError } = useCoverScene(configuration);
  const invalid = !!design && design.status !== "valid";
  useEditorStartup(
    invalid
      ? "ready"
      : fontError
        ? "error"
        : design && ready
          ? "ready"
          : "loading",
  );

  if (invalid || layoutError)
    return (
      <main id="taller" className={styles.error} tabIndex={-1}>
        <h1>No se pudo abrir este diseño.</h1>
        <p role="alert">
          El enlace no es válido o está incompleto. Pide a quien lo compartió
          que te envíe uno nuevo.
        </p>
        <Link href="/">Ir al editor</Link>
      </main>
    );
  return scene && design?.status === "valid" ? (
    <SharedDesignPreview scene={scene} configuration={configuration} />
  ) : null;
};
