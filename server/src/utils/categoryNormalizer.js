/**
 * Escape string untuk regex
 */
const escapeRegex = (s) =>
  s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Cek apakah `rawHeader` mengandung kata/phrase `key` 
 * sebagai _whole word_ (dengan word boundary)
 */
export const containsWholeWord = (raw, key) => {
  const pattern = `\\b${escapeRegex(key.toLowerCase())}\\b`;
  return new RegExp(pattern).test(raw.toLowerCase());
};
