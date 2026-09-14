import type { ThemeSemantic } from "fishtvue/theme/Theme"

// Wave 3.3: дефолтный `primary` снят. Слот стал ОПЦИОНАЛЬНЫМ user-override'ом брендовой палитры
// (его пишет updatePrimaryPalette → эмиссия `--fv-theme-{tone}` в tokens-теге поверх живых
// hsl-формул слота `theme`). Прежние дефолтные формулы никем не потреблялись и после linksTheme
// давали СТАТИЧЕСКИЕ hsl(0 0 …)-строки — эмиссия такого дефолта перебила бы var(--theme)-формулы
// и сломала runtime-смену customThemeColor.
export default <ThemeSemantic>{
  customThemeColor: 0,
  customThemeColorContrast: 0
}
