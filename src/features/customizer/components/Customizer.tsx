"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import type { CoverScene } from "../domain/cover-scene";
import type { CoverConfiguration } from "../domain/configuration";
import { SharedDesignPreview } from "./SharedDesignPreview";
import { CoverPreview } from "./CoverPreview";
import { CustomizationPanel } from "./CustomizationPanel";
import { MobileCoverPreview } from "./MobileCoverPreview";
import { useCustomizer } from "../hooks/useCustomizer";
import { useCoverScene } from "../hooks/useCoverScene";
import { useCompactPreview } from "../hooks/useCompactPreview";
import { useEditorStartup } from "./EditorStartup";
import styles from "./Customizer.module.scss";

export const Customizer = ({
  introduction,
  footer,
}: {
  introduction: ReactNode;
  footer: ReactNode;
}) => {
  const [snapshot, setSnapshot] = useState<{
    configuration: CoverConfiguration;
    scene: CoverScene;
  } | null>(null);
  const editorView = useRef<HTMLDivElement>(null);
  const closePreview = useCallback(() => {
    setSnapshot(null);
    requestAnimationFrame(() => {
      editorView.current
        ?.querySelector<HTMLButtonElement>("[data-share-trigger]")
        ?.focus();
    });
  }, []);
  const editor = useCustomizer();
  const { scene, ready, fontError, layoutError, retry } = useCoverScene(
    editor.configuration,
  );
  const { previewRef, compact, keyboardOpen } = useCompactPreview();
  useEditorStartup(
    fontError ? "error" : ready && editor.initialized ? "ready" : "loading",
  );
  return (
    <>
      <div ref={editorView} hidden={!!snapshot}>
        <main id={snapshot ? undefined : "taller"} tabIndex={-1}>
          {introduction}
          <div className={styles.workshop}>
            <CoverPreview
              scene={scene}
              ready={ready && editor.initialized}
              previewRef={previewRef}
              hiddenFromAT={compact}
            />
            {compact && scene && (
              <MobileCoverPreview scene={scene} keyboardOpen={keyboardOpen} />
            )}
            <div className={styles.panelColumn}>
              {!ready && !fontError && (
                <p className={styles.status} role="status">
                  Preparando la tipografía de tu portada…
                </p>
              )}
              {fontError && (
                <p className={styles.status} role="alert">
                  No se pudo cargar la tipografía.{" "}
                  <button type="button" onClick={retry}>
                    Reintentar
                  </button>
                </p>
              )}
              {layoutError && (
                <p className={styles.status} role="alert">
                  No se pudo ajustar el texto de la portada. Tu texto se
                  conserva; prueba a editarlo.
                </p>
              )}
              {editor.linkWarning && (
                <p className={styles.status} role="alert">
                  {editor.linkWarning}
                </p>
              )}
              <CustomizationPanel
                {...editor}
                onShare={() => {
                  if (scene)
                    setSnapshot({
                      configuration: { ...editor.configuration },
                      scene,
                    });
                }}
                ready={ready && editor.initialized && !layoutError}
              />
            </div>
          </div>
        </main>
        {footer}
      </div>
      {snapshot && (
        <SharedDesignPreview
          scene={snapshot.scene}
          configuration={snapshot.configuration}
          onReturn={closePreview}
        />
      )}
    </>
  );
};
