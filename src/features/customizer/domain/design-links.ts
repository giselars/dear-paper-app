import {
  validateLegacyConfiguration,
  type LegacyCoverConfiguration,
} from "./legacy-configuration";
export type CoverSnapshot = CoverConfiguration | LegacyCoverConfiguration;
import {
  validateConfiguration,
  type CoverConfiguration,
} from "./configuration";

export const maximumDesignLength = 16_384;
export type SharedDesign =
  | { status: "absent" }
  | { status: "invalid" }
  | { status: "valid"; configuration: CoverSnapshot };

export const decodeDesignLink = (search: string): SharedDesign => {
  let payload: string | undefined;
  for (const parameter of search.replace(/^\?/, "").split("&")) {
    const separator = parameter.indexOf("=");
    const rawKey = separator < 0 ? parameter : parameter.slice(0, separator);
    let key: string;
    try {
      key = decodeURIComponent(rawKey.replace(/\+/g, " "));
    } catch {
      continue;
    }
    if (key !== "design") continue;
    const rawValue = separator < 0 ? "" : parameter.slice(separator + 1);
    if (payload !== undefined || rawValue.length > maximumDesignLength * 3)
      return { status: "invalid" };
    try {
      payload = decodeURIComponent(rawValue.replace(/\+/g, " "));
    } catch {
      return { status: "invalid" };
    }
  }
  if (payload === undefined) return { status: "absent" };
  if (!payload || payload.length > maximumDesignLength)
    return { status: "invalid" };
  try {
    const envelope = JSON.parse(payload);
    if (
      !envelope ||
      typeof envelope !== "object" ||
      Array.isArray(envelope) ||
      ![1, 2, 3].includes(envelope.version)
    )
      return { status: "invalid" };
    const result =
      envelope.version === 3
        ? validateConfiguration(envelope.configuration, {
            allowRetiredPalette: true,
          })
        : validateLegacyConfiguration(
            envelope.version === 1 &&
              envelope.configuration &&
              typeof envelope.configuration === "object" &&
              !Array.isArray(envelope.configuration)
              ? { ...envelope.configuration, spineColorId: "terracotta" }
              : envelope.configuration,
            { allowLegacyColors: envelope.version === 1 },
          );
    return result.valid
      ? { status: "valid", configuration: result.configuration }
      : { status: "invalid" };
  } catch {
    return { status: "invalid" };
  }
};

export const createDesignLink = (
  configuration: CoverConfiguration,
  address: string,
): string => {
  const result = validateConfiguration(configuration);
  if (!result.valid) throw new Error("Invalid design");
  const url = new URL(address);
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("Invalid origin");
  url.pathname = "/shared";
  url.search = "";
  url.hash = "";
  url.searchParams.set(
    "design",
    JSON.stringify({ version: 3, configuration: result.configuration }),
  );
  return url.href;
};
