import { linksTheme } from "./helpers/themeHandler"
import toVarsCss from "./helpers/toVarsCss"
import palette from "./helpers/palette"
import useStyle from "./helpers/useStyle"
import { tailwind } from "fishtvue/theme/uno"
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

export { tailwind, palette, toVarsCss, linksTheme, useStyle, NamesTheme }
export default { tailwind, palette, toVarsCss, linksTheme, useStyle, NamesTheme }
