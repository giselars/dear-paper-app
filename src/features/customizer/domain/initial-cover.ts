export const initialCover = {
  compositionId: "botanical",
  paletteId: "ivory-terracotta",
  typographyId: "literary",
  title: "Ideas que toman forma",
  subtitle: "Notas para lo que viene",
} as const;

export const compositions = [
  { id: "botanical", label: "Botánica" },
  { id: "dunes", label: "Dunas" },
  { id: "frame", label: "Marco" },
] as const;

export const coverColors = [
  { id: "sand", label: "Arena", value: "#F3E8D4" },
  { id: "clay", label: "Arcilla", value: "#B66D54" },
  { id: "sage", label: "Salvia", value: "#A8B29A" },
  { id: "rose", label: "Rosa", value: "#D7B6A6" },
  { id: "mist", label: "Niebla", value: "#BDC8C6" },
  { id: "olive", label: "Oliva", value: "#777860" },
] as const;

export const spineColors = [
  { id: "terracotta", label: "Terracota", value: "#AC6044" },
  ...coverColors,
] as const;

export const textTones = [
  { id: "dark", label: "Tinta", value: "#252520" },
  { id: "light", label: "Marfil", value: "#F5F0E6" },
] as const;
