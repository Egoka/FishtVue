# Анализ дублирования в Uno.test.ts

## 📊 Статистика файла

- **Всего строк:** 4,506
- **Всего тест-кейсов:** 1,825
- **Среднее строк на тест-кейс:** ~2.5

---

## 🔍 Паттерны дублирования

### 1. Цветовые тесты (КРИТИЧЕСКОЕ ДУБЛИРОВАНИЕ)

#### Повторяющиеся блоки:

**Специальные значения** (5 тестов × 15+ свойств = 75+ тестов):
- `inherit`, `current`, `transparent`, `black`, `white`
- Повторяется для: text, bg, border, outline, ring, shadow, decoration, accent, caret, fill, stroke

**Opacity тесты** (3 теста × 15+ свойств = 45+ тестов):
- `{property}-white/0`, `{property}-white/50`, `{property}-white/100`

**Цветовая палитра** (11 цветов × 15+ свойств = 165+ тестов):
- slate-50, emerald-100, green-200, lime-300, red-400, orange-500, amber-600, yellow-700, teal-800, cyan-900, sky-950

**Opacity для конкретных цветов** (5 тестов × 15+ свойств = 75+ тестов):
- `red-400/0`, `red-400/50`, `red-400/100`, `red-400/[.06]`, `[#50d71e]/25`

**Итого дублирования для цветов:** ~360 тестов (~20% от всех тестов)

---

### 2. Gradient тесты (ВЫСОКОЕ ДУБЛИРОВАНИЕ)

Градиенты повторяют ту же структуру для `from-`, `via-`, `to-`:

```typescript
// Для from-
{ classValue: "from-inherit", expected: "..." }
{ classValue: "from-current", expected: "..." }
{ classValue: "from-transparent", expected: "..." }
// ... + opacity + palette + arbitrary

// Для via-
{ classValue: "via-inherit", expected: "..." }
{ classValue: "via-current", expected: "..." }
{ classValue: "via-transparent", expected: "..." }
// ... + opacity + palette + arbitrary

// Для to-
{ classValue: "to-inherit", expected: "..." }
{ classValue: "to-current", expected: "..." }
{ classValue: "to-transparent", expected: "..." }
// ... + opacity + palette + arbitrary
```

**Итого:** 3 × (5 + 3 + 11 + 5) = ~72 теста

**Можно сократить до:** 1 генератор функция + 3 вызова

---

### 3. Spacing тесты (СРЕДНЕЕ ДУБЛИРОВАНИЕ)

Размерные значения повторяются для:
- padding (p, px, py, ps, pe, pt, pr, pb, pl)
- margin (m, mx, my, ms, me, mt, mr, mb, ml)
- gap (gap, gap-x, gap-y)
- scroll-margin (scroll-m, scroll-mx, scroll-my, ...)
- scroll-padding (scroll-p, scroll-px, scroll-py, ...)

**Паттерн:**
```typescript
{ classValue: "p-0", expected: ".p-0 {\n  padding: 0px;\n}" }
{ classValue: "p-px", expected: ".p-px {\n  padding: 1px;\n}" }
{ classValue: "p-0.5", expected: ".p-0\\.5 {\n  padding: 0.125rem;\n}" }
// ... повторяется для каждого варианта
```

**Итого:** ~20 размеров × 20+ вариантов = ~400 тестов

**Можно сократить до:** Генератор + axis helper

---

### 4. Sizing тесты (ВЫСОКОЕ ДУБЛИРОВАНИЕ)

Одинаковые значения для:
- width (w, min-w, max-w)
- height (h, min-h, max-h)
- size

**Паттерн:**
```typescript
{ classValue: "w-0", expected: ".w-0 {\n  width: 0px;\n}" }
{ classValue: "h-0", expected: ".h-0 {\n  height: 0px;\n}" }
{ classValue: "min-w-0", expected: ".min-w-0 {\n  min-width: 0px;\n}" }
// ... одинаковые значения
```

**Итого:** ~25 размеров × 6 вариантов = ~150 тестов

**Можно сократить до:** 1 набор размеров + 6 prefix'ов

---

### 5. Псевдо-классы (СРЕДНЕЕ ДУБЛИРОВАНИЕ)

**Паттерн:**
```typescript
{ classValue: "hover:p-0", expected: ".hover\\:p-0:hover {\n  padding: 0px;\n}" }
{ classValue: "active:p-0", expected: ".active\\:p-0:active {\n  padding: 0px;\n}" }
// ... для 30+ псевдо-классов
```

**Итого:** ~30 псевдо-классов

**Можно сократить до:** 1 массив состояний + генератор

---

### 6. Медиа-запросы (НИЗКОЕ ДУБЛИРОВАНИЕ)

**Паттерн:**
```typescript
{ classValue: "sm:p-0", expected: "@media (min-width: 640px) {\n.sm\\:p-0 {\n  padding: 0px;\n}\n}" }
{ classValue: "md:p-0", expected: "@media (min-width: 768px) {\n.md\\:p-0 {\n  padding: 0px;\n}\n}" }
```

**Итого:** ~10 медиа-запросов

**Можно сократить до:** 1 массив breakpoints + генератор

---

## 📈 Статистика дублирования

| Категория | Текущие тесты | Уникальные паттерны | % Дублирования |
|-----------|---------------|---------------------|----------------|
| Цвета | ~360 | ~24 | **93%** |
| Градиенты | ~72 | ~8 | **89%** |
| Spacing | ~400 | ~20 | **95%** |
| Sizing | ~150 | ~25 | **83%** |
| Псевдо-классы | ~30 | ~1 | **97%** |
| Медиа-запросы | ~10 | ~1 | **90%** |
| Остальное | ~803 | ~500 | ~38% |
| **ИТОГО** | **1,825** | **~579** | **~68%** |

---

## 🎯 Приоритеты рефакторинга

### Высокий приоритет (максимальная выгода):
1. ✅ **Spacing тесты** - 95% дублирование, ~400 тестов
2. ✅ **Псевдо-классы** - 97% дублирование, легко рефакторить
3. ✅ **Цветовые тесты** - 93% дублирование, ~360 тестов

### Средний приоритет:
4. ✅ **Медиа-запросы** - 90% дублирование, простой паттерн
5. ✅ **Градиенты** - 89% дублирование
6. ✅ **Sizing** - 83% дублирование

### Низкий приоритет:
7. Остальные тесты - требуют индивидуального подхода

---

## 🛠️ Необходимые Helper-функции

### Для цветов:
- ✅ `generateSpecialColorTests` - inherit, current, transparent, black, white
- ✅ `generateOpacityTests` - white/0, white/50, white/100
- ✅ `generateColorPaletteTests` - slate-50, emerald-100, etc.
- ✅ `generateArbitraryColorTests` - [#50d71e]
- ✅ `generateArbitraryOpacityTests` - [#50d71e]/25
- ✅ `generateFullColorTestSuite` - все вместе

### Для размеров:
- ✅ `generateSizingTests` - базовая функция
- ✅ `COMMON_SIZE_VALUES` - 0, px, 0.5, 1, 2, 4, 8, etc.
- ✅ `SPECIAL_SIZE_VALUES` - auto, full, screen, min, max, fit
- ✅ `FRACTIONAL_VALUES` - 1/2, 1/3, 2/3, etc.

### Для spacing:
- ⚠️ `generateSpacingTests` - с поддержкой axis (x, y, s, e, t, r, b, l)
- ⚠️ `generateNegativeSpacingTests` - для negative margins

### Для градиентов:
- ⚠️ `generateGradientColorTests` - для from/via/to
- ⚠️ `generateGradientPositionTests` - для позиций (0%, 100%)

### Для псевдо-классов:
- ✅ `generatePseudoClassTests` - базовая функция
- ✅ `USER_INTERACTION_STATES` - hover, focus, active, etc.
- ✅ `STRUCTURAL_PSEUDO_CLASSES` - first, last, odd, even, etc.
- ✅ `FORM_STATES` - disabled, checked, required, etc.

### Для медиа-запросов:
- ✅ `generateBreakpointTests` - sm, md, lg, xl, 2xl
- ✅ `generateMediaQueryTests` - произвольные медиа-запросы
- ✅ `BREAKPOINTS` - стандартные breakpoints
- ✅ `PREFERENCE_MEDIA_QUERIES` - motion-reduce, dark, etc.

---

## 📉 Ожидаемый результат

### Текущий файл:
```
4,506 строк
1,825 тест-кейсов
~68% дублирование
```

### После рефакторинга:
```
~1,500-2,000 строк (↓ 60%)
1,825+ тест-кейсов (такое же или больше)
~10-15% дублирование (↓ 80%)
```

### Выгоды:
- ✅ Файл в 2-3 раза меньше
- ✅ Легче читать и понимать
- ✅ Проще добавлять новые тесты
- ✅ Меньше вероятность ошибок при копировании
- ✅ Единый источник правды для значений

---

## 💻 Пример: До и После

### До (50 строк):
```typescript
describe("Text Color", () => {
  it.each([
    { classValue: "text-inherit", expected: ".text-inherit {\n  color: inherit;\n}" },
    { classValue: "text-current", expected: ".text-current {\n  color: currentColor;\n}" },
    { classValue: "text-transparent", expected: ".text-transparent {\n  color: transparent;\n}" },
    { classValue: "text-black", expected: ".text-black {\n  color: #000000;\n}" },
    { classValue: "text-white", expected: ".text-white {\n  color: #ffffff;\n}" },
    { classValue: "text-white/0", expected: ".text-white\\/0 {\n  color: #ffffff00;\n}" },
    { classValue: "text-white/50", expected: ".text-white\\/50 {\n  color: #ffffff80;\n}" },
    { classValue: "text-white/100", expected: ".text-white\\/100 {\n  color: #ffffff;\n}" },
    { classValue: "text-slate-50", expected: ".text-slate-50 {\n  color: #f8fafc;\n}" },
    { classValue: "text-emerald-100", expected: ".text-emerald-100 {\n  color: #d1fae5;\n}" },
    { classValue: "text-green-200", expected: ".text-green-200 {\n  color: #bbf7d0;\n}" },
    { classValue: "text-lime-300", expected: ".text-lime-300 {\n  color: #bef264;\n}" },
    { classValue: "text-red-400", expected: ".text-red-400 {\n  color: #f87171;\n}" },
    { classValue: "text-orange-500", expected: ".text-orange-500 {\n  color: #f97316;\n}" },
    { classValue: "text-amber-600", expected: ".text-amber-600 {\n  color: #d97706;\n}" },
    { classValue: "text-yellow-700", expected: ".text-yellow-700 {\n  color: #a16207;\n}" },
    { classValue: "text-teal-800", expected: ".text-teal-800 {\n  color: #115e59;\n}" },
    { classValue: "text-cyan-900", expected: ".text-cyan-900 {\n  color: #164e63;\n}" },
    { classValue: "text-sky-950", expected: ".text-sky-950 {\n  color: #082f49;\n}" },
    { classValue: "text-[#50d71e]", expected: ".text-\\[\\#50d71e\\] {\n  color: #50d71e;\n}" },
    { classValue: "text-red-400/0", expected: ".text-red-400\\/0 {\n  color: #f8717100;\n}" },
    { classValue: "text-red-400/50", expected: ".text-red-400\\/50 {\n  color: #f8717180;\n}" },
    { classValue: "text-red-400/100", expected: ".text-red-400\\/100 {\n  color: #f87171;\n}" },
    { classValue: "text-red-400/[.06]", expected: ".text-red-400\\/\\[\\.06\\] {\n  color: #f871710f;\n}" },
    { classValue: "text-[#50d71e]/25", expected: ".text-\\[\\#50d71e\\]\\/25 {\n  color: #50d71e40;\n}" }
  ])
})
```

### После (8 строк):
```typescript
describe("Text Color", () => {
  it.each(generateFullColorTestSuite("text", "color"))(
    `tailwind($classValue)`,
    ({ classValue, expected }) => {
      expect(tailwind(classValue)).toBe(expected)
    }
  )
})
```

**Сокращение: 50 строк → 8 строк (84% меньше)**

---

### 2. Gradient Color Stops

#### Текущая структура (одинаковая для from/via/to):

**from-** градиенты (строки 2035-2179):
- Специальные значения: 5 тестов
- Opacity для white: 3 теста
- Цветовая палитра: 11 тестов
- Позиции (0%, 100%): 2 теста
- Opacity для конкретных цветов: 5 тестов

**via-** градиенты (строки 2180-2324):
- Точно такая же структура!

**to-** градиенты (строки 2325-2443):
- Точно такая же структура!

**Итого:** ~145 строк × 3 = ~435 строк

**Можно сократить до:**
```typescript
const gradientPrefixes = ["from", "via", "to"]

describe.each(gradientPrefixes)("%s gradient", (prefix) => {
  it.each(generateGradientColorTests(prefix))
})
```

**Сокращение: 435 строк → ~20 строк (95% меньше)**

---

### 3. Border/Outline/Ring/Shadow Color

Одинаковые тесты для:
- Border Color (строки 2782-2822)
- Outline Color (строки 2863-2906)
- Ring Color (строки 2977-3017)
- Ring Offset Color (строки 3051-3174)
- Shadow Color (строки 3213-3256)
- Divide Color (строки 2599-2711)
- Decoration Color (строки 1639-1720)
- Caret Color (строки 4178-4215)
- Accent Color (строки 4111-4151)
- Fill Color (строки 4397-4436)
- Stroke Color (строки 4438-4476)

**Итого:** 11 × ~40 строк = ~440 строк

**Можно сократить до:**
```typescript
const colorProperties = [
  { prefix: "border", property: "border-color" },
  { prefix: "outline", property: "outline-color" },
  // ...
]

describe.each(colorProperties)("$prefix Color", ({ prefix, property }) => {
  it.each(generateFullColorTestSuite(prefix, property))
})
```

**Сокращение: 440 строк → ~15 строк (97% меньше)**

---

## 🎯 Топ-10 самых дублирующихся паттернов

1. **Цветовые палитры** - 360 тестов, 93% дублирование
2. **Spacing значения** - 400 тестов, 95% дублирование
3. **Gradient colors** - 72 теста, 95% дублирование
4. **Border properties** - 440 тестов, 97% дублирование
5. **Sizing values** - 150 тестов, 83% дублирование
6. **Opacity variants** - 120 тестов, 90% дублирование
7. **Arbitrary color values** - 60 тестов, 85% дублирование
8. **Псевдо-классы** - 30 тестов, 97% дублирование
9. **Position values** - 80 тестов, 80% дублирование
10. **Grid/Flex values** - 50 тестов, 70% дублирование

---

## 💡 Дополнительные находки

### Неиспользуемые тесты:

```typescript
describe.todo("Container", () => {})
describe.todo("Font Smoothing", () => {})
describe.skip("Content", () => { /* tests here */ })
```

**Рекомендация:** Либо реализовать, либо удалить

---

### Дублирующиеся тесты:

В разделе "Max-Width" (строки 1303-1348) есть дублирование:

```typescript
{ classValue: "max-w-full", expected: ".max-w-full {\n  max-width: 100%;\n}" }
// ... другие тесты
{ classValue: "max-w-full", expected: ".max-w-full {\n  max-width: 100%;\n}" } // Дубль!
```

Строки 1325-1345 полностью дублируют строки 1305-1325

**Рекомендация:** Удалить дублирование

---

### Специфичные для значения тесты:

Некоторые тесты используют конкретные значения, которые трудно генерировать:

```typescript
// Специфичные для ring
{ classValue: "ring", expected: ".ring {\n  box-shadow: var(--fv-ring-offset-shadow), var(--fv-ring-shadow), var(--fv-shadow, 0 0 #0000);\n}" }

// Специфичные для line-clamp
{ classValue: "line-clamp-none", expected: ".line-clamp-none {\n  overflow: visible;\n  display: block;\n  -webkit-box-orient: horizontal;\n  -webkit-line-clamp: none;\n}" }
```

**Рекомендация:** Оставить эти тесты явными, не генерировать

---

## 📋 План действий

### Фаза 1: Создание helpers (✅ ГОТОВО)
- [x] Цветовые helpers
- [x] Размерные helpers
- [x] Псевдо-классы helpers
- [x] Медиа-запросы helpers

### Фаза 2: Создание дополнительных helpers (⚠️ В ПРОЦЕССЕ)
- [ ] Gradient helpers
- [ ] Spacing с axis helpers
- [ ] Filter/Backdrop-filter helpers
- [ ] Transform helpers

### Фаза 3: Рефакторинг тестов
- [ ] Цветовые свойства (11 групп)
- [ ] Spacing свойства (5 групп)
- [ ] Sizing свойства (6 групп)
- [ ] Градиенты (3 группы)
- [ ] Остальные

### Фаза 4: Проверка и оптимизация
- [ ] Запуск всех тестов
- [ ] Проверка покрытия
- [ ] Удаление дублирований
- [ ] Добавление новых edge cases

---

## 🎉 Ожидаемый результат

После полного рефакторинга:

**Сокращение кода:**
- С 4,506 строк до ~1,500-2,000 строк
- **Экономия: ~60-66% кода**

**Улучшение структуры:**
- Логичная группировка
- Переиспользуемые helpers
- Единый источник правды

**Улучшение поддерживаемости:**
- Легче добавлять новые тесты
- Легче находить и исправлять ошибки
- Легче понимать структуру

**Возможность расширения:**
- Легко добавить новые цвета
- Легко добавить новые размеры
- Легко добавить новые псевдо-классы

