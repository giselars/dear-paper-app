export const copyDesignLink = async (url: string): Promise<void> => {
  if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
  await navigator.clipboard.writeText(url);
};

export const removeDesignParameter = (): boolean => {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.has("design")) {
      url.searchParams.delete("design");
      window.history.replaceState(window.history.state, "", url.href);
    }
    return true;
  } catch {
    return false;
  }
};
