import type { RouterConfig } from "@nuxt/schema"
import { useNuxtApp } from "#imports"

// https://router.vuejs.org/api/#routeroptions
export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    const nuxtApp = useNuxtApp()

    // Для сохраненной позиции и обычной навигации - мгновенный скролл
    if (savedPosition) {
      return savedPosition
    }

    // Если нет хэша - просто скролл наверх
    if (!to.hash) {
      return {
        top: 0,
        left: 0
      }
    }

    // Для хэша - ждем загрузки страницы и пытаемся найти элемент
    return new Promise((resolve) => {
      let attempts = 0
      const maxAttempts = 3
      const interval = 200

      // Функция для попытки скролла к элементу
      const tryScrollToElement = () => {
        const el = document.querySelector(to.hash)
        if (el) {
          // Если мы на той же странице - плавный скролл
          if (to.path === from.path) {
            // Увеличиваем длительность анимации через CSS
            document.documentElement.style.scrollBehavior = "smooth"
            resolve({
              el,
              top: 100,
              behavior: "smooth"
            })
            // Возвращаем стандартное поведение скролла после анимации
            setTimeout(() => {
              document.documentElement.style.scrollBehavior = ""
            }, 1000)
          } else {
            // Для новой страницы - мгновенный скролл
            resolve({
              el,
              top: 100
            })
          }
        } else if (attempts < maxAttempts) {
          attempts++
          setTimeout(tryScrollToElement, interval)
        } else {
          // Если элемент не найден - скролл наверх
          resolve({ top: 0, left: 0 })
        }
      }

      // Ждем завершения загрузки страницы
      nuxtApp.hooks.hookOnce("page:finish", () => {
        // Даем небольшую задержку для рендеринга контента
        setTimeout(() => {
          tryScrollToElement()
        }, 100)
      })
    })
  }
}
