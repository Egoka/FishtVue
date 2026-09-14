import type { Theme } from "fishtvue/theme/Theme"
import { deepCopy, deepMerge } from "fishtvue/utils/objectHandler"
import { linksTheme } from "./helpers/themeHandler"
import { getLiveFishtVue, injectTokens } from "./helpers/tokensCss"

/**
 * Сливает частичную тему поверх текущей (Wave 3.3 — theme.md Issue 1, публичный контракт
 * docs/content/.../2.Theming.md#updatepreset): deepMerge по копии текущей темы → linksTheme →
 * перезапись tokens-тега. Не тронутые токены сохраняются.
 * Без установленного FishtVue — no-op, возвращает undefined.
 */
export default function updatePreset(partialPreset: Theme): Theme | undefined {
  const fv = getLiveFishtVue()
  if (!fv?.config || !partialPreset) return
  fv.config.theme = linksTheme(deepMerge(deepCopy(fv.config.theme ?? {}), partialPreset))
  injectTokens(fv)
  return fv.config.theme
}
