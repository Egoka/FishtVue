# Рекомендации по улучшению тестов для unoStyle

## 🎯 Цели улучшения

1. **Устранение дублирования кода** - уменьшение количества повторяющихся паттернов
2. **Улучшение читаемости** - более понятная структура тестов
3. **Упрощение поддержки** - легче добавлять новые тесты
4. **Увеличение покрытия** - проверка edge cases

---

## 📊 Анализ текущих проблем

### 1. Дублирование тестов для цветов

**Проблема:** Одинаковые тесты повторяются для разных CSS-свойств
```typescript
// Повторяется для text, bg, border, outline, ring, shadow, etc.
{ classValue: "text-slate-50", expected: ".text-slate-50 {\n  color: #f8fafc;\n}" }
{ classValue: "text-emerald-100", expected: ".text-emerald-100 {\n  color: #d1fae5;\n}" }
// ... и так далее для 11+ цветов
```

**Решение:** Helper-функция `generateColorPaletteTests`
```typescript
const commonColorPalette = [
  { name: "slate", tone: 50, hex: "#f8fafc" },
  { name: "emerald", tone: 100, hex: "#d1fae5" },
  // ...
]

it.each(generateColorPaletteTests("text", "color", commonColorPalette))
```

**Выгода:** 
- Сокращение кода на ~70% для цветовых тестов
- Единый источник цветовых значений
- Легче добавлять новые цвета

---

### 2. Дублирование тестов для opacity

**Проблема:** Тесты opacity повторяются для каждого цветового свойства
```typescript
{ classValue: "text-white/0", expected: ".text-white\\/0 {\n  color: #ffffff00;\n}" }
{ classValue: "text-white/50", expected: ".text-white\\/50 {\n  color: #ffffff80;\n}" }
{ classValue: "text-white/100", expected: ".text-white\\/100 {\n  color: #ffffff;\n}" }
```

**Решение:** Helper-функция `generateOpacityTests`
```typescript
it.each(generateOpacityTests("text", "color"))
```

**Выгода:**
- Сокращение кода на ~60%
- Единая логика для всех opacity тестов
- Легче тестировать новые значения opacity

---

### 3. Дублирование специальных значений

**Проблема:** inherit, current, transparent, black, white повторяются везде
```typescript
{ classValue: "text-inherit", expected: ".text-inherit {\n  color: inherit;\n}" }
{ classValue: "text-current", expected: ".text-current {\n  color: currentColor;\n}" }
{ classValue: "text-transparent", expected: ".text-transparent {\n  color: transparent;\n}" }
```

**Решение:** Helper-функция `generateSpecialColorTests`
```typescript
it.each(generateSpecialColorTests("text", "color"))
```

**Выгода:**
- Сокращение кода на ~80%
- Гарантия полного покрытия специальных значений

---

### 4. Дублирование псевдо-классов

**Проблема:** Каждый псевдо-класс тестируется отдельно с дублированием
```typescript
{ classValue: "hover:p-0", expected: ".hover\\:p-0:hover {\n  padding: 0px;\n}" }
{ classValue: "active:p-0", expected: ".active\\:p-0:active {\n  padding: 0px;\n}" }
{ classValue: "focus:p-0", expected: ".focus\\:p-0:focus {\n  padding: 0px;\n}" }
```

**Решение:** Параметризация через массив
```typescript
const pseudoStates = [
  { modifier: "hover", pseudo: ":hover" },
  { modifier: "active", pseudo: ":active" },
  { modifier: "focus", pseudo: ":focus" }
]

it.each(
  pseudoStates.map(({ modifier, pseudo }) => ({
    classValue: `${modifier}:p-0`,
    expected: `.${modifier}\\:p-0${pseudo} {\n  padding: 0px;\n}`
  }))
)
```

**Выгода:**
- Сокращение кода на ~75%
- Легче добавлять новые псевдо-классы
- Уменьшение вероятности ошибок

---

## 🛠️ Предложенные Helper-функции

### 1. `generateColorPaletteTests`
Генерирует тесты для всей цветовой палитры

```typescript
function generateColorPaletteTests(
  prefix: string,
  property: string,
  colors: Array<{ name: string; tone: number; hex: string }>
): Array<{ classValue: string; expected: string }>
```

**Использование:**
```typescript
it.each(generateColorPaletteTests("text", "color", commonColorPalette))
it.each(generateColorPaletteTests("bg", "background-color", commonColorPalette))
it.each(generateColorPaletteTests("border", "border-color", commonColorPalette))
```

---

### 2. `generateOpacityTests`
Генерирует тесты для значений opacity

```typescript
function generateOpacityTests(
  prefix: string,
  property: string,
  baseColor: string = "white"
): Array<{ classValue: string; expected: string }>
```

**Использование:**
```typescript
it.each(generateOpacityTests("text", "color"))
it.each(generateOpacityTests("bg", "background-color"))
```

---

### 3. `generateSpecialColorTests`
Генерирует тесты для специальных значений (inherit, current, transparent, black, white)

```typescript
function generateSpecialColorTests(
  prefix: string,
  property: string,
  additionalWrapper?: string
): Array<{ classValue: string; expected: string }>
```

**Использование:**
```typescript
it.each(generateSpecialColorTests("text", "color"))
it.each(generateSpecialColorTests("bg", "background-color"))
```

---

### 4. `generateSizingTests`
Генерирует тесты для размерных значений

```typescript
function generateSizingTests(
  prefix: string,
  property: string,
  values: Array<{ input: string; output: string }>
): Array<{ classValue: string; expected: string }>
```

**Использование:**
```typescript
const commonSizes = [
  { input: "0", output: "0px" },
  { input: "px", output: "1px" },
  { input: "0.5", output: "0.125rem" },
  // ...
]

it.each(generateSizingTests("w", "width", commonSizes))
it.each(generateSizingTests("h", "height", commonSizes))
```

---

## 📈 Статистика улучшений

### Текущее состояние
- **Всего тестов:** ~450
- **Строк кода:** ~4500
- **Дублирование:** ~60-70%
- **Читаемость:** Средняя

### После улучшений
- **Всего тестов:** ~450 (то же)
- **Строк кода:** ~1500-2000 (↓ 60%)
- **Дублирование:** ~10-15% (↓ 80%)
- **Читаемость:** Высокая

---

## 🎨 Примеры использования

### До улучшений:
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
    // ... еще 50+ строк
  ])
})
```

### После улучшений:
```typescript
describe("Text Color", () => {
  it.each(generateSpecialColorTests("text", "color"))
  it.each(generateOpacityTests("text", "color"))
  it.each(generateColorPaletteTests("text", "color", commonColorPalette))
  
  // Только специфичные для text-color тесты
  it.each([
    { classValue: "text-red-400/[.06]", expected: ".text-red-400\\/\\[\\.06\\] {\n  color: #f871710f;\n}" }
  ])
})
```

---

## 🔍 Дополнительные улучшения

### 1. Добавить тесты для edge cases
```typescript
describe("Edge Cases", () => {
  it("should handle empty string", () => {
    expect(tailwind("")).toBeUndefined()
  })
  
  it("should handle null", () => {
    expect(tailwind(null as any)).toBeUndefined()
  })
  
  it("should handle undefined", () => {
    expect(tailwind(undefined as any)).toBeUndefined()
  })
  
  it("should handle invalid class names", () => {
    expect(tailwind("invalid-class-123")).toBeUndefined()
  })
  
  it("should handle class with multiple colons", () => {
    expect(tailwind("hover:focus:p-0")).toBeDefined()
  })
})
```

### 2. Группировка по категориям CSS
```typescript
describe("Color Properties", () => {
  describe.each([
    { prefix: "text", property: "color" },
    { prefix: "bg", property: "background-color" },
    { prefix: "border", property: "border-color" },
    { prefix: "outline", property: "outline-color" }
  ])("$prefix ($property)", ({ prefix, property }) => {
    it.each(generateSpecialColorTests(prefix, property))
    it.each(generateOpacityTests(prefix, property))
    it.each(generateColorPaletteTests(prefix, property, commonColorPalette))
  })
})
```

### 3. Добавить snapshot тесты для сложных случаев
```typescript
describe("Complex combinations", () => {
  it("should handle multiple modifiers", () => {
    expect(tailwind("lg:hover:focus:text-red-500/50")).toMatchSnapshot()
  })
})
```

---

## 📝 План внедрения

### Этап 1: Подготовка (1-2 часа)
1. ✅ Создать helper-функции
2. ✅ Создать общие константы (commonColorPalette, commonSizes)
3. ✅ Написать документацию

### Этап 2: Рефакторинг цветовых тестов (2-3 часа)
1. Заменить тесты для text-color
2. Заменить тесты для background-color
3. Заменить тесты для border-color
4. Заменить тесты для outline-color
5. Заменить тесты для ring-color
6. Заменить тесты для shadow-color

### Этап 3: Рефакторинг остальных тестов (2-3 часа)
1. Псевдо-классы и псевдо-элементы
2. Медиа-запросы
3. Sizing (width, height, padding, margin)
4. Typography
5. Layout

### Этап 4: Добавление новых тестов (1-2 часа)
1. Edge cases
2. Complex combinations
3. Error handling

### Этап 5: Проверка и оптимизация (1 час)
1. Запустить все тесты
2. Проверить покрытие
3. Оптимизировать медленные тесты
4. Обновить документацию

**Общее время:** 7-11 часов

---

## ✅ Чек-лист для каждого теста

При переносе тестов убедитесь:

- [ ] Все существующие тесты сохранены
- [ ] Используются helper-функции где возможно
- [ ] Специфичные тесты остаются явными
- [ ] Группировка логична и понятна
- [ ] Имена describe блоков описательны
- [ ] Добавлены комментарии для сложных случаев
- [ ] Все тесты проходят
- [ ] Покрытие не уменьшилось

---

## 🚀 Следующие шаги

1. **Ревью текущих изменений**
2. **Применение helper-функций к остальным тестам**
3. **Улучшение unoRules.ts** (следующий этап)

---

## 💡 Дополнительные идеи

### 1. Type-safe тесты
```typescript
type ColorProperty = "color" | "background-color" | "border-color" | "outline-color"
type ColorPrefix = "text" | "bg" | "border" | "outline"

function generateColorPaletteTests<T extends ColorPrefix>(
  prefix: T,
  property: ColorProperty,
  colors: ColorDefinition[]
): TestCase[]
```

### 2. Parametrized test suites
```typescript
const colorProperties = [
  { prefix: "text", property: "color" },
  { prefix: "bg", property: "background-color" }
] as const

describe.each(colorProperties)("$prefix colors", ({ prefix, property }) => {
  // Автоматическая генерация всех необходимых тестов
  generateAllColorTests(prefix, property)
})
```

### 3. Visual regression tests
```typescript
// Для проверки что CSS действительно работает как ожидается
it("should render correctly", async () => {
  const css = tailwind("text-red-500")
  const screenshot = await renderWithCSS(css)
  expect(screenshot).toMatchImageSnapshot()
})
```

---

## 📚 Выводы

**Преимущества улучшенной структуры:**
- ✅ Меньше кода на ~60%
- ✅ Выше читаемость
- ✅ Проще поддержка
- ✅ Меньше ошибок
- ✅ Быстрее добавление новых тестов

**Недостатки:**
- ⚠️ Требуется начальное время на рефакторинг
- ⚠️ Нужно понимание helper-функций для новых разработчиков

**Рекомендация:** Применить улучшения поэтапно, начиная с самых дублирующихся частей (цвета, opacity).

