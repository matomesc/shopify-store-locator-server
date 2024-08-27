/* eslint-disable no-nested-ternary */
/* eslint-disable no-bitwise */
export function stringToColor(str: string, lightness: number = -10) {
  // Generate a hash for the String
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert hash to rgba
  const rgba =
    ((hash >> 24) & 0xff).toString(16) +
    ((hash >> 16) & 0xff).toString(16) +
    ((hash >> 8) & 0xff).toString(16) +
    (hash & 0xff).toString(16);

  // Change the darkness or lightness
  const num = parseInt(rgba, 16);
  const amt = Math.round(2.55 * lightness);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;

  return (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1);
}
