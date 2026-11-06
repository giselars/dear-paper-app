"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useEditorReady } from "@/features/customizer/components/EditorStartup";
import styles from "./ProjectDialog.module.scss";

type ProjectDialogProps = { triggerClassName?: string; introduction?: boolean };

export const ProjectDialog = ({
  triggerClassName,
  introduction = true,
}: ProjectDialogProps) => {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const editorReady = useEditorReady();
  const [dismissed, setDismissed] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const open = manualOpen || (introduction && editorReady && !dismissed);

  useEffect(() => {
    if (!open) return;
    if (!dialog.current?.open) dialog.current?.showModal();
    const root = document.documentElement;
    const { overflow, scrollbarGutter } = root.style;
    if (window.innerWidth > root.clientWidth)
      root.style.scrollbarGutter = "stable";
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = overflow;
      root.style.scrollbarGutter = scrollbarGutter;
    };
  }, [open]);

  const close = () => {
    setDismissed(true);
    setManualOpen(false);
    dialog.current?.close();
  };
  return (
    <>
      <button
        ref={trigger}
        className={triggerClassName}
        type="button"
        aria-haspopup="dialog"
        aria-controls={`${id}-dialog`}
        onClick={() => setManualOpen(true)}
      >
        El proyecto
      </button>
      <dialog
        ref={dialog}
        id={`${id}-dialog`}
        className={styles.dialog}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-description`}
        onClose={() => {
          setDismissed(true);
          setManualOpen(false);
          if (
            document.activeElement === document.body ||
            dialog.current?.contains(document.activeElement)
          )
            trigger.current?.focus();
        }}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const elements = event.currentTarget.querySelectorAll<HTMLElement>(
            'button, [tabindex="0"]',
          );
          const first = elements[0];
          const last = elements[elements.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }}
      >
        <div className={styles.heading}>
          <p className={styles.brand}>Dear Paper</p>
          <button
            className={styles.close}
            type="button"
            onClick={close}
            aria-label="Cerrar El proyecto"
            autoFocus
          >
            <span aria-hidden="true" />
          </button>
        </div>
        <div
          className={styles.body}
          tabIndex={0}
          role="region"
          aria-label="Información de Dear Paper"
        >
          <p id={`${id}-label`} className={styles.eyebrow}>
            El proyecto
          </p>
          <h2>
            Diseña la portada
            <br />
            de tu libreta.
          </h2>
          <p id={`${id}-description`} className={styles.description}>
            Elige un motivo, ajusta los colores y escribe el título. Comparte el
            diseño con un enlace.
          </p>
          <div className={styles.scope}>
            <p>Una demo digital.</p>
            <p className={styles.note}>
              No es una tienda. La vista previa no es un producto impreso.
            </p>
          </div>
        </div>
        <button className={styles.return} type="button" onClick={close}>
          {introduction ? "Ir al editor" : "Volver al diseño"}{" "}
          <span aria-hidden="true" />
        </button>
      </dialog>
    </>
  );
};
