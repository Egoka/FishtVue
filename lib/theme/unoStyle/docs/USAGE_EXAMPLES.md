# Примеры использования Test Helpers

## 🎯 Быстрый старт

### 1. Импорт helpers

```typescript
import { describe, expect, it } from "vitest"
import { tailwind } from "fishtvue/theme"
import {
  // Генераторы для цветов
  generateFullColorTestSuite,
  generateSpecialColorTests,
  generateOpacityTests,
  generateColorPaletteTests,
  
  // Генераторы для размеров
  generateSizingTests,
  COMMON_SIZE_VALUES,
  SPECIAL_SIZE_VALUES,
  FRACTIONAL_VALUES,
  
  // Генераторы для псевдо-классов
  generatePseudoClassTests,
  generatePseudoElementsWithContentTests,
  USER_INTERACTION_STATES,
  STRUCTURAL_PSEUDO_CLASSES,
  FORM_STATES,
  PSEUDO_ELEMENTS,
  PSEUDO_ELEMENTS_WITH_CONTENT,
  
  // Генераторы для медиа-запросов
  generateBreakpointTests,
  generateMediaQueryTests,
  BREAKPOINTS,
  PREFERENCE_MEDIA_QUERIES,
  
  // Палитры цветов
  COMMON_COLOR_PALETTE,
  FULL_COLOR_PALETTE
} from "./test-helpers"
```

---

## 📘 Примеры использования

### Пример 1: Простой цветовой тест

**До:**
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
    // ... еще 50+ строк
  ])(`tailwind($classValue)`, ({ classValue, expected }) => {
    expect(tailwind(classValue)).toBe(expected)
  })
})
```

**После:**
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

**Результат:** Сокращение с 50+ строк до 5 строк! 🎉

---

### Пример 2: Размерные тесты (Width)

**До:**
```typescript
describe("Width", () => {
  it.each([
    { classValue: "w-0", expected: ".w-0 {\n  width: 0px;\n}" },
    { classValue: "w-px", expected: ".w-px {\n  width: 1px;\n}" },
    { classValue: "w-0.5", expected: ".w-0\\.5 {\n  width: 0.125rem;\n}" },
    { classValue: "w-1", expected: ".w-1 {\n  width: 0.25rem;\n}" },
    // ... еще 30+ строк
  ])
})
```

**После:**
```typescript
describe("Width", () => {
  it.each([
    ...generateSizingTests("w", "width", COMMON_SIZE_VALUES),
    ...generateSizingTests("w", "width", SPECIAL_SIZE_VALUES),
    ...generateSizingTests("w", "width", FRACTIONAL_VALUES)
  ])(`tailwind($classValue)`, ({ classValue, expected }) => {
    expect(tailwind(classValue)).toBe(expected)
  })
  
  // Только специфичные для width тесты
  it.each([
    { classValue: "w-3xs", expected: ".w-3xs {\n  width: 16rem;\n}" },
    { classValue: "w-2xs", expected: ".w-2xs {\n  width: 18rem;\n}" },
    { classValue: "w-[96rem]", expected: ".w-\\[96rem\\] {\n  width: 96rem;\n}" }
  ])(`tailwind($classValue)`, ({ classValue, expected }) => {
    expect(tailwind(classValue)).toBe(expected)
  })
})
```

---

### Пример 3: Псевдо-классы

**До:**
```typescript
describe("Hover, focus, and active", () => {
  it.each([
    { classValue: "hover:p-0", expected: ".hover\\:p-0:hover {\n  padding: 0px;\n}" },
    { classValue: "active:p-0", expected: ".active\\:p-0:active {\n  padding: 0px;\n}" },
    { classValue: "visited:p-0", expected: ".visited\\:p-0:visited {\n  padding: 0px;\n}" },
    { classValue: "target:p-0", expected: ".target\\:p-0:target {\n  padding: 0px;\n}" },
    { classValue: "focus:p-0", expected: ".focus\\:p-0:focus {\n  padding: 0px;\n}" },
    // ... еще строки
  ])
})
```

**После:**
```typescript
describe("Hover, focus, and active", () => {
  it.each(generatePseudoClassTests(USER_INTERACTION_STATES))(
    `tailwind($classValue)`,
    ({ classValue, expected }) => {
      expect(tailwind(classValue)).toBe(expected)
    }
  )
})
```

---

### Пример 4: Responsive breakpoints

**До:**
```typescript
describe("Responsive breakpoints", () => {
  it.each([
    { classValue: "sm:p-0", expected: "@media (min-width: 640px) {\n.sm\\:p-0 {\n  padding: 0px;\n}\n}" },
    { classValue: "md:p-0", expected: "@media (min-width: 768px) {\n.md\\:p-0 {\n  padding: 0px;\n}\n}" },
    { classValue: "lg:p-0", expected: "@media (min-width: 1024px) {\n.lg\\:p-0 {\n  padding: 0px;\n}\n}" },
    // ...
  ])
})
```

**После:**
```typescript
describe("Responsive breakpoints", () => {
  it.each(generateBreakpointTests(BREAKPOINTS))(
    `tailwind($classValue)`,
    ({ classValue, expected }) => {
      expect(tailwind(classValue)).toBe(expected)
    }
  )
})
```

---

### Пример 5: Комбинированные тесты для всех цветовых свойств

**До:** Дублирование для каждого свойства (text, bg, border, outline, ring, shadow, etc.)

**После:**
```typescript
describe("Color Properties", () => {
  const colorProperties = [
    { prefix: "text", property: "color", name: "Text Color" },
    { prefix: "bg", property: "background-color", name: "Background Color" },
    { prefix: "border", property: "border-color", name: "Border Color" },
    { prefix: "outline", property: "outline-color", name: "Outline Color" },
    { prefix: "ring", property: "--fv-ring-color", name: "Ring Color" },
    { prefix: "shadow", property: "--fv-shadow-color", name: "Shadow Color" }
  ]

  describe.each(colorProperties)("$name", ({ prefix, property }) => {
    it.each(generateFullColorTestSuite(prefix, property))(
      `tailwind($classValue)`,
      ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      }
    )
  })
})
```

**Результат:** Один блок кода вместо 6 повторяющихся! 🚀

---

## 🔧 Продвинутые примеры

### Кастомные палитры цветов

```typescript
// Создаем кастомную палитру для тестирования определенных цветов
const BLUE_PALETTE: ColorDefinition[] = [
  { name: "blue", tone: 50, hex: "#eff6ff" },
  { name: "blue", tone: 100, hex: "#dbeafe" },
  { name: "blue", tone: 500, hex: "#3b82f6" },
  { name: "blue", tone: 900, hex: "#1e3a8a" }
]

it.each(generateColorPaletteTests("text", "color", BLUE_PALETTE))
```

---

### Кастомные размеры

```typescript
// Тестируем только большие размеры
const LARGE_SIZES: SizeValue[] = [
  { input: "64", output: "16rem" },
  { input: "72", output: "18rem" },
  { input: "80", output: "20rem" },
  { input: "96", output: "24rem" }
]

it.each(generateSizingTests("w", "width", LARGE_SIZES))
```

---

### Комбинация модификаторов

```typescript
describe("Combined modifiers", () => {
  const breakpoints = ["sm", "md", "lg"]
  const states = ["hover", "focus", "active"]
  
  const combinedTests = breakpoints.flatMap(bp =>
    states.map(state => ({
      classValue: `${bp}:${state}:text-red-500`,
      // Генерация ожидаемого результата
      expected: generateExpectedForCombined(bp, state, "text-red-500")
    }))
  )
  
  it.each(combinedTests)(`tailwind($classValue)`, ({ classValue, expected }) => {
    expect(tailwind(classValue)).toBe(expected)
  })
})
```

---

### Группировка тестов с одинаковой структурой

```typescript
describe("Spacing Properties", () => {
  const spacingProperties = [
    { prefix: "p", property: "padding", name: "Padding" },
    { prefix: "m", property: "margin", name: "Margin" },
    { prefix: "gap", property: "gap", name: "Gap" }
  ]

  describe.each(spacingProperties)("$name", ({ prefix, property }) => {
    it.each(generateSizingTests(prefix, property, COMMON_SIZE_VALUES))(
      `tailwind($classValue)`,
      ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      }
    )
  })
})
```

---

## 📊 Сравнение результатов

### До улучшений:
```
✓ Typography (1543 ms)
  ✓ Text Color (234 строки кода)
  ✓ Background Color (234 строки кода)
  ✓ Border Color (234 строки кода)
  
Итого: ~700 строк дублирования
```

### После улучшений:
```
✓ Typography (1548 ms)
  ✓ Text Color (5 строк кода)
  ✓ Background Color (5 строк кода)
  ✓ Border Color (5 строк кода)
  
Итого: ~15 строк + переиспользуемые helpers
```

**Экономия: ~95% кода! 🎉**

---

## 🎨 Структура улучшенного тестового файла

```typescript
import { describe, expect, it } from "vitest"
import { tailwind } from "fishtvue/theme"
import {
  generateFullColorTestSuite,
  generateSizingTests,
  generatePseudoClassTests,
  // ... другие helpers
} from "./test-helpers"

describe("unoStyle", () => {
  // Базовые тесты
  describe("Special tests", () => {
    it("Not string", () => {
      expect(tailwind(42 as any)).toBeUndefined()
    })
  })

  // Цветовые свойства - используем describe.each для группировки
  describe("Color Properties", () => {
    const colorProps = [
      { prefix: "text", property: "color" },
      { prefix: "bg", property: "background-color" }
    ]
    
    describe.each(colorProps)("$prefix", ({ prefix, property }) => {
      it.each(generateFullColorTestSuite(prefix, property))(
        `tailwind($classValue)`,
        ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        }
      )
    })
  })

  // Размерные свойства
  describe("Sizing Properties", () => {
    const sizingProps = [
      { prefix: "w", property: "width" },
      { prefix: "h", property: "height" }
    ]
    
    describe.each(sizingProps)("$prefix", ({ prefix, property }) => {
      it.each([
        ...generateSizingTests(prefix, property, COMMON_SIZE_VALUES),
        ...generateSizingTests(prefix, property, SPECIAL_SIZE_VALUES)
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
  })

  // Псевдо-классы - используем describe.each для группировки
  describe("Pseudo-classes", () => {
    const pseudoGroups = [
      { name: "User Interaction", states: USER_INTERACTION_STATES },
      { name: "Structural", states: STRUCTURAL_PSEUDO_CLASSES },
      { name: "Form States", states: FORM_STATES }
    ]
    
    describe.each(pseudoGroups)("$name", ({ states }) => {
      it.each(generatePseudoClassTests(states))(
        `tailwind($classValue)`,
        ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        }
      )
    })
  })
})
```

---

## ✅ Checklist при рефакторинге

При переносе тестов на новые helpers:

- [ ] Убедитесь, что все существующие тесты покрыты
- [ ] Проверьте, что специфичные edge cases сохранены
- [ ] Запустите тесты и убедитесь, что все проходят
- [ ] Проверьте покрытие кода
- [ ] Добавьте комментарии к сложным случаям
- [ ] Обновите документацию если нужно

---

## 🚀 Следующие шаги

1. Начните с самых дублирующихся тестов (цвета)
2. Постепенно переносите остальные тесты
3. Добавляйте новые helpers по мере необходимости
4. Регулярно запускайте тесты для проверки

---

## 💡 Советы

1. **Не бойтесь создавать новые helpers** - если видите повторение, создайте helper
2. **Группируйте похожие тесты** - используйте `describe.each`
3. **Сохраняйте специфичные тесты явными** - не все нужно генерировать
4. **Документируйте сложные случаи** - добавляйте комментарии
5. **Тестируйте helpers** - убедитесь что они работают корректно

---

## 📚 Полезные ссылки

- [Vitest Documentation](https://vitest.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Test Patterns](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

