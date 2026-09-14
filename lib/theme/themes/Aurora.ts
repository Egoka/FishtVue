import type { FishtVueConfiguration } from "fishtvue/config"
import defaultPrimitive from "fishtvue/theme/primitive"
import defaultSemantic from "fishtvue/theme/semantic"

/**
 * ## Aurora — тёплая тема (default)
 *
 * Три встроенные темы различаются **только брендовым слотом** (`theme-50`…`theme-950`): его
 * оттенок и насыщенность приезжают в CSS-переменные `--theme` / `--theme-contrast`, из которых
 * `primitive.ts` собирает hsla-шкалу. Остальная палитра (22 именованных цвета), spacing, radius,
 * shadow и duration у всех трёх общие — дублировать их в трёх файлах незачем.
 *
 * Поле `name` в пресетах не хранится: идентичность активной темы живёт в
 * `config.optionsTheme.nameTheme`, и `install()` нормализует его до фактически применённой темы.
 */
export default <FishtVueConfiguration["theme"]>{
  primitive: defaultPrimitive,
  semantic: { ...defaultSemantic, customThemeColor: "25deg", customThemeColorContrast: "88%" }
}
