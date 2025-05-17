import { useI18n } from "vue-i18n"
import { useRoute } from "#vue-router"

export function useEditLink() {
  const route = useRoute()
  const { locale, t } = useI18n()
  const { site } = useAppConfig()
  return computed(() => ({
    text: t("EditThisPage"),
    url: site.editLink.replace(/:path/g, `${locale.value}${route.path}`)
  }))
}
