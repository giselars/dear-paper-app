export type TextFieldName = "title" | "subtitle";
export const textLimits = { title: 40, subtitle: 80 } as const;

export const validateCoverText = (
  value: string,
  field: TextFieldName,
): string | undefined => {
  if (
    Array.from(value).some((char) => {
      const code = char.codePointAt(0)!;
      return (
        code < 32 ||
        (code >= 0xd800 && code <= 0xdfff) ||
        code === 0xfffe ||
        code === 0xffff ||
        code === 0x2028 ||
        code === 0x2029
      );
    })
  )
    return "Usa texto en una sola línea, sin caracteres de control.";
  if (Array.from(value).length > textLimits[field])
    return `Máximo ${textLimits[field]} caracteres.`;
};
