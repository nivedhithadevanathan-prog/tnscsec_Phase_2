export function cleanText(text: string | null | undefined): string | null {
  if (text === null || text === undefined) {
    return null;
  }

  return text.replace(/[\r\n]+/g, " ").trim();
}
