// Элементы, способные исполнять код или ломать разметку — вырезаются целиком (с содержимым).
const DANGEROUS_ELEMENTS = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "noscript",
  "template",
  "title",
  "textarea",
  "xmp",
  "noembed",
  "noframes",
  "form",
  "base",
  "link",
  "meta",
  "svg",
  "math"
]

// URL-атрибуты, в которых проверяем опасные протоколы.
const URL_ATTRS = "href|src|xlink:href|action|formaction|background|poster|srcset"

/**
 * Best-effort dependency-free sanitizer для `v-html` (Alert `subtitle`).
 *
 * Чисто строковый → **SSR-safe** (не зависит от DOM, работает и на сервере, и в браузере).
 * Удаляет:
 * - опасные элементы (`<script>`/`<style>`/`<iframe>`/`<object>`/`<svg>`/… — с содержимым);
 * - inline event-handler атрибуты (`onerror`/`onload`/`onclick`/…);
 * - опасные протоколы (`javascript:`/`vbscript:`/`data:text/html`) в URL-атрибутах.
 *
 * ⚠️ Это **не** замена DOMPurify: строковая санитизация не ловит все обфускации.
 * Для недоверенного ввода с богатой разметкой используйте slot `#subtitle` + собственную
 * проверенную санитизацию. См. [issues/alert.md Issue 1](../../Documentation/issues/alert.md).
 */
export function sanitizeHtml(html?: string | null): string {
  if (!html) return ""
  let out = String(html)

  // 1. Опасные элементы (открывающий тег + опционально содержимое и закрывающий тег).
  const blockRe = new RegExp(`<\\s*(${DANGEROUS_ELEMENTS.join("|")})\\b[^>]*>([\\s\\S]*?<\\s*/\\s*\\1\\s*>)?`, "gi")
  // Итеративно — на случай вложенных / обфусцированных конструкций (`<scr<script>ipt>`).
  let prev: string
  do {
    prev = out
    out = out.replace(blockRe, "")
  } while (out !== prev)

  // 2. Оставшиеся «осиротевшие» закрывающие теги опасных элементов.
  out = out.replace(new RegExp(`<\\s*/\\s*(?:${DANGEROUS_ELEMENTS.join("|")})\\s*>`, "gi"), "")

  // 3. Inline event-handler атрибуты (onerror, onload, onclick, …).
  out = out.replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")

  // 4. Опасные протоколы в URL-атрибутах — удаляем атрибут целиком.
  out = out.replace(new RegExp(`\\s+(?:${URL_ATTRS})\\s*=\\s*("[^"]*"|'[^']*'|[^\\s>]+)`, "gi"), (match, value) => {
    // Нормализуем: снимаем кавычки, убираем whitespace (ловит `java\tscript:`), lowercase.
    const normalized = value
      .replace(/^["']|["']$/g, "")
      .replace(/\s+/g, "")
      .toLowerCase()
    return /^(?:javascript:|vbscript:|data:text\/html)/.test(normalized) ? "" : match
  })

  return out
}
