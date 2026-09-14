import type { FishtVueConfiguration } from "fishtvue/config"
import defaultPrimitive from "fishtvue/theme/primitive"
import defaultSemantic from "fishtvue/theme/semantic"

/**
 * ## Sapphire — синяя тема
 *
 * Отличается от Aurora и Harmony только брендовым слотом — см. комментарий в [Aurora](./Aurora.ts).
 */
export default <FishtVueConfiguration["theme"]>{
  primitive: defaultPrimitive,
  semantic: { ...defaultSemantic, customThemeColor: "217deg", customThemeColorContrast: "84%" }
}
