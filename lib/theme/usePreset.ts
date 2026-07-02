import type { Theme } from "fishtvue/theme/Theme"
import { linksTheme } from "./helpers/themeHandler"
import { getLiveFishtVue, injectTokens } from "./helpers/tokensCss"

/**
 * Полностью заменяет текущую тему пресетом (Wave 3.3 — theme.md Issue 1, публичный контракт
 * docs/content/.../2.Theming.md#usepreset). Ссылки `{path}` внутри пресета резолвятся linksTheme,
 * затем tokens-тег переписывается — все смонтированные компоненты перекрашиваются без перезагрузки.
 * Цвета, не заданные пресетом, возвращаются к запечённым fallback'ам движка.
 * Без установленного FishtVue — no-op, возвращает undefined.
 */
export default function usePreset(preset: Theme): Theme | undefined {
  const fv = getLiveFishtVue()
  if (!fv?.config || !preset) return
  fv.config.theme = linksTheme(preset)
  injectTokens(fv)
  return fv.config.theme
}
