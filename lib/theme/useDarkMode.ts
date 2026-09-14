import { onUnmounted, ref, type Ref } from "vue"
import { isClient } from "fishtvue/utils/domHandler"
import { useFishtVue } from "fishtvue/config"

/**
 * Реактивный флаг тёмной темы, согласованный с движком стилей.
 *
 * Источник истины — `optionsTheme.darkModeSelector`, тот же, что `Component` отдаёт движку как
 * `darkSelector` ([component/index.ts](../component/index.ts)). Если селектор сконфигурирован,
 * движок скоупит все `dark:*`-варианты на него **вместо** `prefers-color-scheme`, поэтому и флаг
 * обязан читать DOM, а не OS-preference: иначе при `<html class="dark">` и светлой системной теме
 * получится `false`, и компонент покрасится в light-оттенок посреди тёмной страницы.
 *
 * Селектор не задан → дефолт движка, fallback на `prefers-color-scheme: dark`.
 *
 * Обе ветки снимают свои слушатели в `onUnmounted`, поэтому вызывать только из `setup()`.
 * На сервере возвращает всегда `false` — DOM читать нечем.
 *
 * @example
 * const isDark = useDarkMode()
 * const color = computed(() => (isDark.value ? "theme.600" : "theme.500"))
 */
export function useDarkMode(): Ref<boolean> {
  const isDark = ref<boolean>(false)
  if (!isClient()) return isDark

  const darkModeSelector = useFishtVue()?.config?.optionsTheme?.darkModeSelector ?? ""

  if (darkModeSelector) {
    const checkDarkMode = () => (isDark.value = !!document.querySelector(darkModeSelector))
    checkDarkMode()
    // eslint-disable-next-line no-undef
    let observer: MutationObserver | undefined = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      // селектором может быть и класс (`.dark`), и data-атрибут (`[data-theme='dark']`)
      attributeFilter: ["class", "data-theme"],
      subtree: true
    })
    onUnmounted(() => {
      observer?.disconnect()
      observer = undefined
    })
  } else {
    const colorSchemeQueryList = window.matchMedia("(prefers-color-scheme: dark)")
    const setColorScheme = (event: { matches: boolean }) => (isDark.value = event.matches)

    isDark.value = colorSchemeQueryList.matches
    colorSchemeQueryList.addEventListener("change", setColorScheme)
    onUnmounted(() => colorSchemeQueryList.removeEventListener("change", setColorScheme))
  }

  return isDark
}

export default useDarkMode
