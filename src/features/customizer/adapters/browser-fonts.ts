import type { MeasureText } from "../domain/cover-scene";

export const loadCoverMetrics = async (): Promise<MeasureText> => {
  const styles = getComputedStyle(document.documentElement);
  const families = {
    title: styles.getPropertyValue("--font-editorial").trim(),
    subtitle: styles.getPropertyValue("--font-ui").trim(),
  };
  const fonts = await Promise.all(
    Object.values(families).map((family) => {
      // next/font appends a local system fallback that may not exist on Android.
      // Only the bundled primary family is required for the editor to be ready.
      const primaryFamily = family.split(",")[0].trim();
      if (!primaryFamily) throw new Error("Missing cover font family");
      return document.fonts.load(
        `400 16px ${primaryFamily}`,
        "Ideas ÁÉÍÓÚ áéíóú ñ ü ¿¡",
      );
    }),
  );
  if (
    fonts.some(
      (faces) =>
        !faces.length || faces.some((face) => face.status !== "loaded"),
    )
  )
    throw new Error("Missing cover fonts");
  const context = document.createElement("canvas").getContext("2d");
  if (!context) throw new Error("Text measurement unavailable");
  return (text, size, role) => {
    context.font = `400 ${size}px ${families[role]}`;
    const metrics = context.measureText(text);
    return {
      width: Math.max(
        metrics.width,
        metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight,
      ),
      ascent: metrics.actualBoundingBoxAscent,
      descent: metrics.actualBoundingBoxDescent,
    };
  };
};

// A failed FontFace retains its rejected load promise for this document.
// This action is exposed only before editing is enabled, so no edits are lost.
export const retryCoverFontLoad = () => window.location.reload();
