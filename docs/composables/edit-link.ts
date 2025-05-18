import { useI18n } from "vue-i18n"

export function useEditLink() {
  const { t } = useI18n()
  const { site } = useAppConfig()
  const pageId = inject("pageId")
  return computed(() => ({
    text: t("EditThisPage"),
    url: site.editLink.replace(/:path/g, `${pageId}`)
  }))
}
