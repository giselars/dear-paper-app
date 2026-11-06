import { useEffect, useMemo, useState } from "react";
import {
  loadCoverMetrics,
  retryCoverFontLoad,
} from "../adapters/browser-fonts";
import {
  createCoverScene,
  estimateText,
  type MeasureText,
} from "../domain/cover-scene";
import type { CoverSnapshot } from "../domain/design-links";

export const useCoverScene = (configuration: CoverSnapshot) => {
  const [measurement, setMeasurement] = useState<{
    measure: MeasureText | null;
    error: boolean;
  }>({ measure: null, error: false });
  useEffect(() => {
    let cancelled = false;
    loadCoverMetrics()
      .then((measure) => {
        if (!cancelled) setMeasurement({ measure, error: false });
      })
      .catch(() => {
        if (!cancelled) setMeasurement({ measure: null, error: true });
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const result = useMemo(() => {
    try {
      return {
        scene: createCoverScene(
          configuration,
          measurement.measure ?? estimateText,
        ),
        layoutError: false,
      };
    } catch {
      return { scene: null, layoutError: true };
    }
  }, [configuration, measurement.measure]);
  return {
    ...result,
    ready: !!measurement.measure,
    fontError: measurement.error,
    retry: retryCoverFontLoad,
  };
};
