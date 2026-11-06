"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { retryCoverFontLoad } from "../adapters/browser-fonts";
import styles from "./EditorStartup.module.scss";

type StartupPhase = "loading" | "ready" | "error";
const StartupContext = createContext<Dispatch<
  SetStateAction<StartupPhase>
> | null>(null);
const EditorReadyContext = createContext(false);

export const useEditorReady = () => useContext(EditorReadyContext);

export const useEditorStartup = (phase: StartupPhase) => {
  const report = useContext(StartupContext);
  useEffect(() => {
    report?.((current) => (current === "ready" ? current : phase));
  }, [phase, report]);
};

export const EditorStartup = ({ children }: { children: ReactNode }) => {
  const [phase, setPhase] = useState<StartupPhase>("loading");
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setMinimumElapsed(true), 800);
    return () => window.clearTimeout(timer);
  }, []);
  const showEditor = phase === "ready" && minimumElapsed;
  return (
    <StartupContext.Provider value={setPhase}>
      {!showEditor && (
        <main className={styles.screen} aria-label="Preparación del editor">
          <p className={styles.descriptor}>Un pequeño taller digital</p>
          <div className={styles.identity}>
            <h1 className={styles.brand}>Dear Paper</h1>
            {phase !== "error" ? (
              <>
                <span className={styles.loader} aria-hidden="true" />
                <p className={styles.status} role="status">
                  Cargando el editor…
                </p>
              </>
            ) : (
              <>
                <p className={styles.status} role="alert">
                  No se pudo cargar la tipografía.
                </p>
                <button
                  className={styles.retry}
                  type="button"
                  onClick={retryCoverFontLoad}
                >
                  Reintentar
                </button>
              </>
            )}
          </div>
          <p className={styles.signature}>Portadas de libreta · A5</p>
        </main>
      )}
      <EditorReadyContext.Provider value={showEditor}>
        <div hidden={!showEditor}>{children}</div>
      </EditorReadyContext.Provider>
    </StartupContext.Provider>
  );
};
