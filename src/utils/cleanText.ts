export function cleanText(text: string | null | undefined) {
  if (!text) return text;
  return text.replace(/[\r\n]+/g, " ").trim();
}
