import type { FishtVueConfiguration } from "fishtvue/config"
import defaultPrimitive from "fishtvue/theme/primitive"
import defaultSemantic from "fishtvue/theme/semantic"

/**
 * ## Harmony — зелёная тема
 *
 * Отличается от Aurora и Sapphire только брендовым слотом — см. комментарий в [Aurora](./Aurora.ts).
 */
export default <FishtVueConfiguration["theme"]>{
  primitive: defaultPrimitive,
  semantic: { ...defaultSemantic, customThemeColor: "152deg", customThemeColorContrast: "56%" }
}
