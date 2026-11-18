import { continueRender, delayRender, staticFile } from "remotion";

export const SERIF = "Cinzel, serif";
export const SERIF_ITALIC = "'Cormorant Garamond', serif";
export const SANS = "Montserrat, sans-serif";
export const EMOJI = "'Noto Color Emoji'";

const faces: [string, string, string, string][] = [
  ["Cinzel", "cinzel-latin-500-normal.woff2", "500", "normal"],
  ["Cinzel", "cinzel-latin-700-normal.woff2", "700", "normal"],
  ["Montserrat", "montserrat-latin-600-normal.woff2", "600", "normal"],
  ["Montserrat", "montserrat-latin-800-normal.woff2", "800", "normal"],
  ["Cormorant Garamond", "cormorant-garamond-latin-500-italic.woff2", "500", "italic"],
];

const handle = delayRender("Loading fonts");
Promise.all(
  faces.map(([family, file, weight, style]) => {
    const f = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format('woff2')`, {
      weight,
      style,
    });
    return f.load().then((loaded) => document.fonts.add(loaded));
  }),
)
  .then(() => continueRender(handle))
  .catch((err) => {
    console.error(err);
    continueRender(handle);
  });
