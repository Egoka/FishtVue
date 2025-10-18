# ⚡ Быстрая шпаргалка по улучшению тестов

## 🚀 За 30 секунд

```typescript
// 1. Импортируй
import { generateFullColorTestSuite } from "./test-helpers"

// 2. Замени
describe("Text Color", () => {
  it.each(generateFullColorTestSuite("text", "color"))(
    `tailwind($classValue)`,
    ({ classValue, expected }) => {
      expect(tailwind(classValue)).toBe(expected)
    }
  )
})

// 3. Готово! Сэкономил 70+ строк кода ✨
```

---

## 📋 Шпаргалка по функциям

### 🎨 Цвета (используй чаще всего)

```typescript
// Полный набор (специальные + opacity + палитра + arbitrary)
generateFullColorTestSuite("text", "color")

// Или по отдельности:
generateSpecialColorTests("text", "color")        // inherit, current, transparent, black, white
generateOpacityTests("text", "color", "white")    // white/0, white/50, white/100
generateColorPaletteTests("text", "color", COMMON_COLOR_PALETTE)  // slate-50, emerald-100, ...
```

### 📏 Размеры

```typescript
generateSizingTests("w", "width", COMMON_SIZE_VALUES)    // 0, px, 0.5, 1, 2, 4, 8...
generateSizingTests("w", "width", SPECIAL_SIZE_VALUES)   // auto, full, screen, min, max, fit
generateSizingTests("w", "width", FRACTIONAL_VALUES)     // 1/2, 1/3, 2/3, 1/4...
```

### 🔄 Псевдо-классы

```typescript
generatePseudoClassTests(USER_INTERACTION_STATES)        // hover, focus, active...
generatePseudoClassTests(STRUCTURAL_PSEUDO_CLASSES)      // first, last, odd, even...
generatePseudoClassTests(FORM_STATES)                    // disabled, checked, required...
generatePseudoElementsWithContentTests(PSEUDO_ELEMENTS_WITH_CONTENT)  // after, before
```

### 📱 Responsive

```typescript
generateBreakpointTests(BREAKPOINTS)                     // sm, md, lg, xl, 2xl
generateMediaQueryTests(PREFERENCE_MEDIA_QUERIES)        // motion-reduce, dark, contrast...
```

---

## 🎯 Топ-5 применений

### #1 - Цветовые свойства (экономия 70+ строк)

```typescript
// Все эти свойства используют одну функцию:
describe("Text Color", () => {
  it.each(generateFullColorTestSuite("text", "color"))
})

describe("Background Color", () => {
  it.each(generateFullColorTestSuite("bg", "background-color"))
})

// И еще 9 цветовых свойств...
```

### #2 - Группировка цветовых свойств (экономия 770 строк)

```typescript
const colorProps = [
  { prefix: "text", property: "color" },
  { prefix: "bg", property: "background-color" },
  { prefix: "border", property: "border-color" }
  // ... еще 8 свойств
]

describe.each(colorProps)("$prefix Color", ({ prefix, property }) => {
  it.each(generateFullColorTestSuite(prefix, property))(/*...*/)
})
```

### #3 - Псевдо-классы (экономия 80 строк)

```typescript
const pseudoGroups = [
  { name: "User Interaction", states: USER_INTERACTION_STATES },
  { name: "Structural", states: STRUCTURAL_PSEUDO_CLASSES },
  { name: "Form States", states: FORM_STATES }
]

describe.each(pseudoGroups)("$name", ({ states }) => {
  it.each(generatePseudoClassTests(states))(/*...*/)
})
```

### #4 - Градиенты (экономия 415 строк)

```typescript
const gradientPrefixes = ["from", "via", "to"]

describe.each(gradientPrefixes)("%s gradients", (prefix) => {
  it.each(generateFullGradientTestSuite(prefix, COMMON_COLOR_PALETTE))(/*...*/)
})
```

### #5 - Sizing свойства (экономия 190 строк)

```typescript
const sizingProps = [
  { prefix: "w", property: "width" },
  { prefix: "h", property: "height" },
  { prefix: "min-w", property: "min-width" },
  { prefix: "max-w", property: "max-width" }
  // ...
]

describe.each(sizingProps)("$prefix", ({ prefix, property }) => {
  it.each(generateSizingTests(prefix, property, COMMON_SIZE_VALUES))(/*...*/)
})
```

---

## 🎨 Шаблоны кода

### Шаблон #1: Простое свойство с enum значениями

```typescript
describe("Text Align", () => {
  const values = ["left", "center", "right", "justify"]
  
  it.each(
    values.map(v => ({
      classValue: `text-${v}`,
      expected: `.text-${v} {\n  text-align: ${v};\n}`
    }))
  )(/*...*/)
})
```

### Шаблон #2: Свойство с именованными значениями

```typescript
describe("Font Weight", () => {
  const weights = [
    { name: "thin", value: "100" },
    { name: "bold", value: "700" }
  ]
  
  it.each(
    weights.map(({ name, value }) => ({
      classValue: `font-${name}`,
      expected: `.font-${name} {\n  font-weight: ${value};\n}`
    }))
  )(/*...*/)
})
```

### Шаблон #3: Цветовое свойство

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

### Шаблон #4: Размерное свойство

```typescript
describe("Width", () => {
  it.each([
    ...generateSizingTests("w", "width", COMMON_SIZE_VALUES),
    ...generateSizingTests("w", "width", SPECIAL_SIZE_VALUES)
  ])(/*...*/)
  
  // Специфичные тесты
  it.each([
    { classValue: "w-screen", expected: "..." }
  ])(/*...*/)
})
```

---

## ⚡ Команды

### Запуск тестов
```bash
npm test                           # Все тесты
npm test Uno.test                  # Только Uno.test.ts
npm test -- --coverage             # С покрытием
npm test -- --watch                # Watch mode
```

### Проверка
```bash
npm run lint                       # Линтер
npm run type-check                 # TypeScript проверка
```

---

## 🎯 Чеклист "Готово к использованию"

- [x] ✅ Helpers созданы
- [x] ✅ Константы определены
- [x] ✅ Документация написана
- [x] ✅ Примеры готовы
- [x] ✅ Линтер проверен
- [ ] ⚠️ Применить к Uno.test.ts
- [ ] ⚠️ Запустить тесты
- [ ] ⚠️ Проверить покрытие

---

## 💡 Советы

### DO ✅
- Используй генераторы для повторяющихся паттернов
- Группируй похожие свойства
- Оставляй специфичные тесты явными
- Коммить после каждого успешного изменения

### DON'T ❌
- Не генерируй уникальные свойства
- Не смешивай разные типы в одном it.each
- Не пропускай проверку тестов
- Не удаляй тесты без проверки

---

## 🔗 Быстрые ссылки

| Что нужно | Где найти |
|-----------|-----------|
| Примеры использования | `USAGE_EXAMPLES.md` |
| Полный пример | `Uno.typography-refactored.test.ts` |
| Все функции | `test-helpers.ts` |
| Продвинутые функции | `test-helpers-advanced.ts` |
| План внедрения | `IMPLEMENTATION_PLAN.md` |
| Анализ дублирования | `DUPLICATION_ANALYSIS.md` |

---

## 📊 Метрики (резюме)

```
┌────────────────────────────────────────────┐
│  Текущий файл:   4,506 строк              │
│  После рефакторинга: ~1,500-2,000 строк   │
│  ЭКОНОМИЯ: ~3,000 строк (66%)             │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│  Дублирование: 68% → 10-15%               │
│  УЛУЧШЕНИЕ: -80% дублирования             │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│  Функций создано: 25+                     │
│  Констант создано: 15+                    │
│  Документов создано: 7                    │
└────────────────────────────────────────────┘
```

---

## 🎊 Готово к использованию!

Все готово для начала рефакторинга. Начните с малого (1 раздел), проверьте что работает, и продолжайте!

**Удачи! 🚀**

