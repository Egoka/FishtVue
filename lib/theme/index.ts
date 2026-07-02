import { linksTheme } from "./helpers/themeHandler"
import toVarsCss from "./helpers/toVarsCss"
import palette from "./helpers/palette"
import useStyle from "./helpers/useStyle"
import { tailwind } from "fishtvue/theme/uno"
// Wave 3.3 — runtime theme API (theme.md Issue 1): см. Documentation/architecture/theme.md §8.
import usePreset from "./usePreset"
import updatePreset from "./updatePreset"
import updatePrimaryPalette from "./updatePrimaryPalette"
import updateSurfacePalette from "./updateSurfacePalette"
import $dt from "./$dt"
import { buildTokensCss, injectTokens, TOKENS_STYLE_NAME } from "./helpers/tokensCss"
import type { NamesTheme as Themes } from "./Theme"

const NamesTheme: (keyof typeof Themes)[] = [
  "Aurora", // (заря)
  // "Larimar", // (ларимар)
  // "Nimbus", // (нимбус)
  // "Celestia", // (селестия)
  // "Velvet", // (бархат)
  "Harmony", // (гармония)
  // "Serenity", // (безмятежность)
  "Sapphire" // (сапфир)
  // "Eclipse", // (затмение)
  // "Iris" // (ирис)
]

export {
  tailwind,
  palette,
  toVarsCss,
  linksTheme,
  useStyle,
  NamesTheme,
  usePreset,
  updatePreset,
  updatePrimaryPalette,
  updateSurfacePalette,
  $dt,
  buildTokensCss,
  injectTokens,
  TOKENS_STYLE_NAME
}
export default {
  tailwind,
  palette,
  toVarsCss,
  linksTheme,
  useStyle,
  NamesTheme,
  usePreset,
  updatePreset,
  updatePrimaryPalette,
  updateSurfacePalette,
  $dt
}
