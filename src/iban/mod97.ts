function expandLetters(value: string): string {
  return value
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0);
      return code >= 65 && code <= 90 ? String(code - 55) : ch;
    })
    .join('');
}

export function passesMod97(normalizedIban: string): boolean {
  const rearranged = normalizedIban.slice(4) + normalizedIban.slice(0, 4);
  const numeric = expandLetters(rearranged);
  if (!/^[0-9]+$/.test(numeric)) return false;
  return BigInt(numeric) % 97n === 1n;
}
