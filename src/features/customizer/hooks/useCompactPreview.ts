import { useEffect, useRef, useState } from "react";

export const useCompactPreview = () => {
  const previewRef = useRef<HTMLElement>(null);
  const [compact, setCompact] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;
    const media = matchMedia("(max-width: 767px)");
    const update = () => {
      const header =
        document.querySelector("header")?.getBoundingClientRect().height ?? 76;
      setCompact(
        media.matches && preview.getBoundingClientRect().bottom <= header,
      );
    };
    const observer = new IntersectionObserver(update, {
      threshold: [0, 0.01, 1],
      rootMargin: "-76px 0px 0px 0px",
    });
    observer.observe(preview);
    media.addEventListener("change", update);
    window.addEventListener("scroll", update, { passive: true });
    let baseline = window.innerHeight;
    let viewportWidth = window.innerWidth;
    const updateKeyboard = () => {
      if (viewportWidth !== window.innerWidth) {
        viewportWidth = window.innerWidth;
        baseline = window.innerHeight;
      }
      const editing =
        document.activeElement instanceof HTMLInputElement &&
        document.activeElement.type === "text";
      if (!editing) baseline = window.innerHeight;
      const height = window.visualViewport?.height ?? window.innerHeight;
      setKeyboardOpen(media.matches && editing && baseline - height > 140);
    };
    window.visualViewport?.addEventListener("resize", updateKeyboard);
    document.addEventListener("focusin", updateKeyboard);
    document.addEventListener("focusout", updateKeyboard);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
      window.removeEventListener("scroll", update);
      window.visualViewport?.removeEventListener("resize", updateKeyboard);
      document.removeEventListener("focusin", updateKeyboard);
      document.removeEventListener("focusout", updateKeyboard);
    };
  }, []);
  return { previewRef, compact, keyboardOpen };
};
