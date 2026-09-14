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

// Значение атрибута: в двойных кавычках, в одинарных или без кавычек.
const ATTR_VALUE = `"[^"]*"|'[^']*'|[^\\s>]+`

// Символ, после которого HTML-парсер начинает НОВЫЙ атрибут: whitespace, `/`
// (`<a/href=…>`) и закрывающая кавычка предыдущего значения (`<a x="1"href=…>` —
// «missing-whitespace-between-attributes» парсится как два атрибута). Проверка только
// на `\s+` пропускала оба варианта. Символ границы сохраняется в выводе (см. `stripAttrs`):
// для кавычки он закрывает предыдущее значение, выбросить его нельзя.
const ATTR_BOUNDARY = `[\\s/"']`

// Символы, с которых HTML-токенизатор начинает разметку сразу после `<`: ASCII-буква
// (`<a …`), `/` (закрывающий тег), `!` (comment / doctype / bogus comment) и `?` (bogus
// comment). Всё остальное (`< a`, `1 < 2`, `<=`) парсер оставляет обычным ТЕКСТОМ, поэтому
// такие `<` не открывают участок разметки и атрибуты внутри них не ищутся.
const MARKUP_START_RE = /[a-zA-Z/!?]/

// Одиночный whitespace-символ (без флага `g` — используется только с `test`).
const WS_RE = /\s/

// Опасные схемы (проверяются по началу нормализованного значения атрибута).
const DANGEROUS_SCHEME_RE = /^(?:javascript:|vbscript:|data:text\/html)/

// Whitespace + все control characters (включая NUL, который не входит в `\s`) — браузер
// игнорирует их внутри схемы, поэтому при нормализации вырезаем целиком.
// Правило `no-control-regex` ловит СЛУЧАЙНОЕ попадание control characters в шаблон; здесь они и
// есть объект поиска (обходы вида `java<TAB>script:`), поэтому подавляем его точечно.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_RE = /[\s\u0000-\u001f\u007f]+/g

// Именованные character references, значимые для проверки схемы: `javascript&colon;`.
// Прототип отрезан (`Object.create(null)`), иначе `&constructor;` резолвился бы в Function.
const NAMED_REFS: Record<string, string | undefined> = Object.assign(Object.create(null), {
  colon: ":",
  sol: "/",
  tab: "\t",
  newline: "\n"
})

// Character references: hex (`&#x6a;`), decimal (`&#106;`, `&#0000106;`) и именованные —
// каждая форма как с завершающей `;`, так и без неё.
const CHAR_REF_RE = /&#[xX]([0-9a-fA-F]+)(;?)|&#([0-9]+)(;?)|&([a-zA-Z][a-zA-Z0-9]*)(;?)/g

/**
 * Максимальный префикс цифр, значение которого укладывается в ASCII (<= 0x7F).
 * Нужен для ссылок без `;`: `&#x6aavascript:` — жадный разбор даёт `0x6aa`, но
 * «щадящий» ASCII-разбор даёт `j` + `avascript:`. Проверяем оба варианта.
 */
function asciiPrefix(digits: string, radix: number): { code: number; rest: string } {
  // Значение накапливается инкрементально (а не `parseInt(digits.slice(0, i))` на каждом шаге):
  // на входе вида `&#<200000 нулей>38y=1` разбор префикса заново давал квадратичную сложность
  // и подвешивал санитизацию на несколько секунд. Аккумулятор не переполняется — цикл
  // прерывается, как только значение выходит за ASCII.
  let best = 1
  let code = parseInt(digits[0], radix)
  let acc = code
  for (let i = 1; i < digits.length; i++) {
    acc = acc * radix + parseInt(digits[i], radix)
    if (acc > 0x7f) break
    best = i + 1
    code = acc
  }
  return { code, rest: digits.slice(best) }
}

/** Единственный проход декодирования character references. */
function decodeCharRefs(input: string, asciiLenient: boolean): string {
  return input.replace(CHAR_REF_RE, (match, hex, hexSemi, dec, decSemi, name) => {
    if (hex !== undefined) {
      if (hexSemi || !asciiLenient) return String.fromCodePoint(Math.min(parseInt(hex, 16), 0x10ffff))
      const { code, rest } = asciiPrefix(hex, 16)
      return String.fromCodePoint(code) + rest
    }
    if (dec !== undefined) {
      if (decSemi || !asciiLenient) return String.fromCodePoint(Math.min(parseInt(dec, 10), 0x10ffff))
      const { code, rest } = asciiPrefix(dec, 10)
      return String.fromCodePoint(code) + rest
    }
    const decoded = NAMED_REFS[String(name).toLowerCase()]
    return decoded !== undefined ? decoded : match
  })
}

/**
 * Нормализация значения URL-атрибута перед проверкой схемы: снимаем кавычки,
 * вырезаем whitespace/control characters, декодируем character references РОВНО ОДИН раз,
 * снова вырезаем control characters (декодирование способно их произвести: `java&#9;script:`),
 * lowercase.
 *
 * Один проход — ровно столько, сколько делает HTML-парсер при токенизации значения атрибута;
 * именно его результат уходит в URL-парсер. Обоснование политики — в doc-комментарии
 * `sanitizeHtml`. Завершимость тривиальна: цикла нет.
 *
 * Вырезание control characters до и после декодирования, `toLowerCase` и вызов из
 * `isDangerousUrl` в двух режимах (`asciiLenient`) — намеренная over-approximation:
 * блокируем чуть шире, чем строгая спецификация, ради запаса прочности.
 *
 * Результат используется ТОЛЬКО для проверки схемы и никогда не попадает обратно в выходной HTML.
 */
function normalizeUrlValue(value: string, asciiLenient: boolean): string {
  const stripped = String(value)
    .replace(/^["']|["']$/g, "")
    .replace(CONTROL_CHARS_RE, "")
  return decodeCharRefs(stripped, asciiLenient).replace(CONTROL_CHARS_RE, "").toLowerCase()
}

/**
 * Проход HTML-токенизатора по участку разметки, начинающемуся на `start` (позиция `<`).
 * Возвращает индекс ЗА концом участка; если передан `inValue`, попутно помечает в нём позиции
 * ВНУТРИ значения атрибута в кавычках — от открывающей кавычки до символа перед закрывающей.
 *
 * Состояния — подмножество состояний спецификации, ровно те, что нужны, чтобы ответить на
 * вопрос «открывает ли эта кавычка значение атрибута»:
 * - `TAG_NAME` — имя тега. `=` и кавычки здесь ЧАСТЬ ИМЕНИ (`<a="x">` — имя тега `a="`),
 *   значение не открывается;
 * - `BEFORE_NAME` — перед именем атрибута. `=` тут не «присваивание», а первый символ имени
 *   («unexpected-equals-sign-before-attribute-name»), поэтому `<a =" href="javascript:x">` —
 *   это атрибут с именем `="` и ЖИВОЙ `href`, а не значение в кавычках;
 * - `IN_NAME`/`AFTER_NAME` — имя атрибута и позиция после него; только отсюда `=` ведёт в
 *   `BEFORE_VALUE`;
 * - `BEFORE_VALUE` — единственное состояние, где кавычка ОТКРЫВАЕТ значение. Внутри такого
 *   значения `>` тег НЕ закрывает (`<a title="a>b" href=…>` — один тег);
 * - `IN_UNQUOTED` — значение без кавычек: кавычки и `=` внутри него обычные символы.
 *
 * В любом другом состоянии кавычка — обычный символ, и `>` закрывает тег:
 * `<a "b>c" href="javascript:x">` браузер разбирает как тег `<a "b>` плюс текст, и мы так же.
 *
 * Закрывающая кавычка НЕ помечается в `inValue`: именно она — легальная граница следующего
 * атрибута («missing-whitespace-between-attributes», `<a x="1"href=…>`).
 *
 * Незакрытая кавычка и незакрытый тег в конце входа: браузер выбрасывает такой тег целиком,
 * поэтому считаем разметкой весь остаток и сообщаем об этом через `out.open` (`stripAttrs`
 * такой участок выбрасывает — см. там). Расхождения смещены в сторону БОЛЬШЕГО участка —
 * лишний разбор вырежет максимум подозрительный атрибут внутри поломанного тега, тогда как
 * слишком короткий участок оставил бы атрибут за границей проверки (обход).
 *
 * Завершимость: `i` строго возрастает на каждой итерации (внутренний `indexOf` двигает его
 * вперёд), выход — по `>` или по концу строки.
 */
const TAG_NAME = 0
const BEFORE_NAME = 1
const IN_NAME = 2
const AFTER_NAME = 3
const BEFORE_VALUE = 4
const IN_UNQUOTED = 5

function scanMarkup(input: string, start: number, inValue?: boolean[], out?: { open: boolean }): number {
  let state = TAG_NAME
  for (let i = start + 1; i < input.length; i++) {
    const ch = input[i]
    // Значения в кавычках проскакиваются целиком (см. `BEFORE_VALUE`), поэтому во ВСЕХ
    // состояниях, до которых доходит цикл, `>` закрывает тег.
    if (ch === ">") return i + 1
    const ws = WS_RE.test(ch)
    // Позиции, на которых токенизатор НЕ может начать новое имя атрибута:
    // - внутри имени тега (`<ahref="href="/href=…>` — имя тега `ahref="href="`, кавычки в нём
    //   обычные символы, а не границы атрибутов);
    // - ожидание значения (`href=<здесь>…`: whitespace тут не разделитель атрибутов, а часть
    //   состояния «before attribute value»);
    // - внутренности значения без кавычек.
    // Whitespace (и `/` для имени тега) наоборот ЗАКАНЧИВАЕТ имя/значение и является легальной
    // границей следующего атрибута (`<scr href=…"ipt>`, `<a/href=…>`), поэтому не помечается.
    if (
      inValue &&
      (state === BEFORE_VALUE || (state === IN_UNQUOTED && !ws) || (state === TAG_NAME && !ws && ch !== "/"))
    )
      inValue[i] = true
    switch (state) {
      case TAG_NAME:
        if (ws || ch === "/") state = BEFORE_NAME
        break
      case BEFORE_NAME:
        // `/` — «self-closing start tag state», возвращает в before attribute name.
        if (!ws && ch !== "/") state = IN_NAME
        break
      case IN_NAME:
        state = ws ? AFTER_NAME : ch === "=" ? BEFORE_VALUE : ch === "/" ? BEFORE_NAME : IN_NAME
        break
      case AFTER_NAME:
        if (ch === "=") state = BEFORE_VALUE
        else if (ch === "/") state = BEFORE_NAME
        else if (!ws) state = IN_NAME
        break
      case BEFORE_VALUE:
        if (ws) break
        if (ch === '"' || ch === "'") {
          const close = input.indexOf(ch, i + 1)
          if (inValue) for (let j = i; j < (close === -1 ? input.length : close); j++) inValue[j] = true
          if (close === -1) {
            if (out) out.open = true
            return input.length
          }
          i = close
          // «after attribute value (quoted)» ведёт себя как before attribute name: пробел и `/`
          // просто переводят дальше, любой другой символ начинает НОВОЕ имя атрибута.
          state = BEFORE_NAME
        } else state = IN_UNQUOTED
        break
      default:
        // IN_UNQUOTED: значение без кавычек заканчивается только на whitespace (или на `>`
        // выше). Кавычки, `=` и `/` внутри него — обычные символы (`href=/a"b`).
        if (ws) state = BEFORE_NAME
        break
    }
  }
  if (out) out.open = true
  return input.length
}

/**
 * Применяет `transform` ТОЛЬКО к участкам разметки, текст между тегами копируется байт-в-байт.
 *
 * Без этого разбиения поиск атрибутов шёл по всей строке, и обычная проза с кавычкой перед
 * `name=value` (`<p>писать "onclick=foo" нельзя</p>`) теряла кусок текста: граница атрибута
 * `[\s/"']` срабатывала внутри текстового узла. Атрибуты существуют только внутри тега —
 * значит и вырезать их можно только там.
 *
 * Завершимость: `i` строго возрастает (`lt + 1 > i` либо `scanMarkup(...) > lt >= i`).
 */
function mapTagRegions(input: string, transform: (region: string) => string): string {
  let out = ""
  let i = 0
  for (;;) {
    const lt = input.indexOf("<", i)
    if (lt === -1) return out + input.slice(i)
    const next = input[lt + 1]
    if (next === undefined || !MARKUP_START_RE.test(next)) {
      out += input.slice(i, lt + 1)
      i = lt + 1
      continue
    }
    const end = scanMarkup(input, lt)
    out += input.slice(i, lt) + transform(input.slice(lt, end))
    i = end
  }
}

/**
 * Вырезает атрибуты, совпавшие с `re` (символ-границы — первая capture-группа);
 * `strip` решает по совпадению, удалять ли конкретный атрибут.
 *
 * Почему не `String.prototype.replace`: совпадение поглощает закрывающую кавычку значения,
 * а она служит границей для СЛЕДУЮЩЕГО атрибута. Иначе безопасный атрибут «прикрывал» бы
 * опасный (`<a href="/ok"href="javascript:…">`), а в цепочке `onerror="a"onerror="b"`
 * уцелел бы каждый второй. Поэтому после каждого совпадения откатываем `lastIndex` на 1.
 *
 * Совпадения, начавшиеся ВНУТРИ значения атрибута в кавычках, отбрасываются. Регулярное
 * выражение не знает состояния токенизатора и может «зацепиться» за символ-границу, который на
 * самом деле лежит внутри чужого значения; дальше `ATTR_VALUE` спаривает КАВЫЧКИ НЕ ТЕ, и
 * настоящий опасный атрибут целиком проглатывается как часть безобидного значения:
 * `<a title="href=" href="javascript:x">` — совпадение начиналось на открывающей кавычке
 * `title`, значением считалось `" href="`, проверка схемы проходила, и живой
 * `href="javascript:x"` доезжал до DOM. Позиции значений даёт `scanMarkup` (маска `inValue`),
 * закрывающая кавычка в маску не входит — она легальная граница.
 *
 * Завершимость: длина совпадения минимум 6 символов (граница + имя ≥ 3 + `=` + значение ≥ 1),
 * поэтому после отката `lastIndex >= m.index + 5`; при пропуске совпадения `lastIndex` растёт
 * на 1. Индексы совпадений строго возрастают в обоих случаях, итераций не больше `len`.
 */
function stripAttrs(input: string, re: RegExp, strip: (match: RegExpExecArray) => boolean): string {
  const inValue: boolean[] = new Array(input.length).fill(false)
  const tag = { open: false }
  scanMarkup(input, 0, inValue, tag)
  // Тег без закрывающего `>` (в том числе из-за незакрытой кавычки): парсер доедает до конца
  // входа и ВЫБРАСЫВАЕТ такой тег целиком вместе с остатком. Частичное удаление атрибута из
  // него «чинит» разметку и способно ОЖИВИТЬ то, чего браузер бы не исполнил:
  // `<pdata-x=" onclick="\nonclick=alert(1)>` инертен (кавычка не закрыта), но после выреза
  // первого `onclick="` превращается в тег с живым обработчиком. Поэтому выбрасываем участок
  // целиком — ровно как парсер.
  if (tag.open) return ""
  re.lastIndex = 0
  let result = ""
  let copied = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(input)) !== null) {
    if (inValue[match.index]) {
      // Не атрибут, а кусок чужого значения — продолжаем поиск с СЛЕДУЮЩЕЙ позиции, иначе
      // настоящий атрибут за этим значением остался бы ненайденным.
      re.lastIndex = match.index + 1
      continue
    }
    const end = match.index + match[0].length
    if (strip(match)) {
      // Из-за отката `lastIndex` следующее совпадение начинается ВНУТРИ уже вырезанного
      // куска (`match.index === copied - 1`) — его «граница» это закрывающая кавычка
      // предыдущего, уже удалённого значения. Возвращать такой символ в вывод нельзя:
      // оригинала в разметке больше нет, и копия приклеивается к имени следующего атрибута
      // (`<a href="javascript:a"href="javascript:b"href="/ok">` → `<a "href="/ok">`, где
      // парсер видит атрибут с именем `"href` — безопасный href уничтожен).
      //
      // Поэтому символ границы возвращается только когда он лежит в сохраняемом тексте
      // (`match.index >= copied`) — там для кавычки он закрывает предыдущее значение.
      // Для «фантомной» границы пишем пробел: он не может быть частью имени атрибута и так
      // же надёжно не даёт соседним кускам склеиться в новый тег (`<scr` + `ipt`).
      result += input.slice(copied, match.index) + (match.index >= copied ? match[1] : " ")
      copied = end
    }
    re.lastIndex = end - 1
  }
  return result + input.slice(copied)
}

/** Значение URL-атрибута ведёт на опасную схему? */
function isDangerousUrl(value: string): boolean {
  // Нормализуем двумя способами и блокируем, если ХОТЯ БЫ один даёт опасную схему:
  // жадный разбор (как в спецификации) и ASCII-щадящий — для ссылок без `;`,
  // где `&#x6aavascript:` может быть прочитан браузером как `j` + `avascript:`.
  return (
    DANGEROUS_SCHEME_RE.test(normalizeUrlValue(value, false)) ||
    DANGEROUS_SCHEME_RE.test(normalizeUrlValue(value, true))
  )
}

/**
 * Best-effort dependency-free sanitizer для `v-html` (Alert `subtitle`).
 *
 * Чисто строковый → **SSR-safe** (не зависит от DOM, работает и на сервере, и в браузере).
 * Удаляет:
 * - опасные элементы (`<script>`/`<style>`/`<iframe>`/`<object>`/`<svg>`/… — с содержимым);
 * - inline event-handler атрибуты (`onerror`/`onload`/`onclick`/…);
 * - опасные протоколы (`javascript:`/`vbscript:`/`data:text/html`) в URL-атрибутах — включая
 *   формы, закодированные character references (`&#106;avascript:`, `&#x6a;avascript:`,
 *   `javascript&colon;`) и с whitespace/control characters внутри схемы.
 *
 * Атрибут распознаётся не только после whitespace, но и после `/` и после закрывающей
 * кавычки предыдущего значения — HTML-парсер во всех трёх случаях начинает новый атрибут
 * (`<a/href=…>`, `<a x="1"href=…>`, `<img src="x"onerror=…>`).
 *
 * Поиск атрибутов ведётся ТОЛЬКО внутри участков разметки (`mapTagRegions` + `scanMarkup`):
 * текст между тегами копируется байт-в-байт. Иначе широкая граница атрибута срабатывала бы
 * в обычной прозе (`<p>писать "onclick=foo" нельзя</p>` теряло часть текста). Внутри участка
 * совпадение обязано начинаться на позиции, где токенизатор действительно может начать новый
 * атрибут, — не внутри значения соседнего атрибута в кавычках (см. `stripAttrs`).
 *
 * ## Политика декодирования: РОВНО ОДИН проход
 *
 * Character references в значении атрибута раскрываются один раз — столько же, сколько делает
 * HTML-парсер при токенизации, и именно этот результат попадает в URL-парсер. Отсюда:
 * - `&#106;avascript:` и `javascript&colon;` — после одного декодирования это схема
 *   `javascript:` ⇒ блокируем;
 * - `&amp;#106;avascript:` и `&#38;#106;avascript:` — после одного декодирования это
 *   байт-в-байт одинаковый текст `&#106;avascript:`, то есть инертный ОТНОСИТЕЛЬНЫЙ URL,
 *   а не схема ⇒ пропускаем.
 *
 * Больше одного прохода — over-blocking: санитайзер начал бы вырезать ссылки, которые браузер
 * никогда не исполнит. Хуже того, любой конечный предел проходов создаёт «обрыв» по глубине
 * вложенности (раньше: 1-5 режем, 6+ нет) и разный вердикт для эквивалентных записей одного и
 * того же значения (`&#38;#106;…` резали, а `&amp;#106;…` — нет, потому что `amp` не входит в
 * `NAMED_REFS`). Единственный проход убирает и то, и другое.
 *
 * Обратите внимание: over-approximation ВНУТРИ прохода сохранена намеренно — вырезание
 * control characters до и после декодирования и двойная нормализация (жадная + ASCII-щадящая)
 * в `isDangerousUrl` с блокировкой, если сработал ХОТЯ БЫ один вариант.
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
  // 2. Оставшиеся «осиротевшие» закрывающие теги опасных элементов.
  const orphanRe = new RegExp(`<\\s*/\\s*(?:${DANGEROUS_ELEMENTS.join("|")})\\s*>`, "gi")

  // Итеративно и ОБА шага в ОДНОМ цикле — до общей неподвижной точки. Любое удаление способно
  // склеить соседние куски в новый тег (`<scr` + `ipt>`), поэтому результат обязан пройти проверку
  // заново. Пока шаг 2 стоял ОТДЕЛЬНО и ПОСЛЕ цикла, он сам изготавливал исполняемый элемент из
  // инертного ввода: `<scr</script>ipt>alert(1)</scr</script>ipt>` (браузер видит тег с именем
  // `scr<`, ничего не исполняется) после выреза обоих `</script>` превращался в настоящий
  // `<script>alert(1)</script>`, и шаг 1 его уже не видел. То же для `<sty</style>le>` и
  // `<sv</svg>g …>`.
  //
  // Завершимость: оба `replace` только УДАЛЯЮТ, поэтому каждый результативный проход строго
  // укорачивает `out`; непродуктивный проход даёт `out === prev` и выходит. Длина — целое
  // неотрицательное число, значит проходов не больше длины входа.
  let prev: string
  do {
    prev = out
    out = out.replace(blockRe, "").replace(orphanRe, "")
  } while (out !== prev)

  // 3-4. Атрибуты вырезаются ТОЛЬКО внутри участков разметки (`mapTagRegions`): текст между
  // тегами копируется байт-в-байт. Границы участка определяет `findTagEnd` по правилам
  // HTML-токенизатора — иначе проза с кавычкой перед `name=value` теряла бы куски.
  const handlerRe = new RegExp(`(${ATTR_BOUNDARY})on\\w+\\s*=\\s*(?:${ATTR_VALUE})`, "gi")
  const urlRe = new RegExp(`(${ATTR_BOUNDARY})(?:${URL_ATTRS})\\s*=\\s*(${ATTR_VALUE})`, "gi")
  out = mapTagRegions(out, (tag) =>
    // 3. Inline event-handler атрибуты (onerror, onload, onclick, …).
    // 4. Опасные протоколы в URL-атрибутах — удаляем атрибут целиком.
    stripAttrs(
      stripAttrs(tag, handlerRe, () => true),
      urlRe,
      (m) => isDangerousUrl(m[2])
    )
  )

  return out
}
