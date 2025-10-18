# 🔍 Глубокий анализ unoRules.ts

## 📊 Статистика файла

- **Размер:** 1,826 строк
- **Правил (стилей):** ~55+ правил верхнего уровня
- **Дублирование:** ~60-70%
- **Основная проблема:** Много повторяющихся паттернов

---

## 🎯 Найденные паттерны дублирования

### 1. ЦВЕТОВЫЕ ПРАВИЛА (КРИТИЧЕСКОЕ ДУБЛИРОВАНИЕ - 70%)

Повторяющаяся структура для **11 свойств:**

| Свойство | Строки | Паттерн |
|----------|--------|---------|
| `text` | 131-186 | abstract + color + specialColor |
| `decoration` | 188-236 | abstract + color + specialColor + style + thickness |
| `bg` | 435-497 | abstract + color + specialColor + position + attachment + sizes |
| `from` | 499-539 | abstract + color + specialColor + position |
| `via` | 541-581 | abstract + color + specialColor + position |
| `to` | 584-624 | abstract + color + specialColor + position |
| `border` | 642-688 | sides + style + color + specialColor + table |
| `divide` | 690-739 | width + style + color + specialColor + abstract |
| `outline` | 741-791 | abstract + width + offset + style + color + specialColor |
| `ring` | 793-870 | abstract + width + offset + color + specialColor + colorOffset |
| `shadow` | 872-917 | abstract + size + color + specialColor |
| `accent` | 1149-1184 | abstract + color + specialColor |
| `caret` | 1203-1238 | abstract + color + specialColor |
| `fill` | 1331-1371 | abstract + color + specialColor + noneColor |
| `stroke` | 1373-1419 | abstract + color + specialColor + noneColor + width |

**Повторяющийся код для цветов:**
```typescript
// Этот паттерн повторяется 15 раз!!!
reg: {
  abstract: new RegExp(
    /(?<style>PREFIX)-(\[(?<abstract>.*?)])\/?((?<opacity>\d+)\b|(\[(?<abstractOpacity>.*?)]))?|(\((?<custom>.*?)\))/
  ),
  color: new RegExp(
    `(?<style>PREFIX)-(?<special>${Object.keys(colors).join("|")})\\b-(?<tone>\\d+)\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
  ),
  specialColor: new RegExp(
    `(?<style>PREFIX)-(?<special>${Object.keys(specialColor).join("|")})\\b\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
  )
},
getValue(classStyle) {
  const reg = this.reg as Record<"abstract" | "color" | "specialColor", RegExp>
  if (reg.abstract.test(classStyle)) {
    const groups = classStyle.match(reg.abstract)?.groups as GroupsRegExp
    if (groups?.abstract?.startsWith("#"))
      return `PROPERTY: ${addAlphaToHex(custom(groups), opacity)};`
  } else if (reg.color.test(classStyle)) {
    const groups = classStyle.match(reg.color)?.groups as GroupsRegExp
    return `PROPERTY: ${addAlphaToHex(colors[groups.special][groups.tone], opacity)};`
  } else if (reg.specialColor.test(classStyle)) {
    const groups = classStyle.match(reg.specialColor)?.groups as GroupsRegExp
    return `PROPERTY: ${addAlphaToHex(specialColor[groups.special], opacity)};`
  }
}
```

**Дублирование:** ~100 строк × 15 свойств = **~1,500 строк** потенциального дублирования!

---

### 2. FILTER ПРАВИЛА (ВЫСОКОЕ ДУБЛИРОВАНИЕ - 90%)

Повторяющаяся структура для **8 фильтров:**

| Фильтр | Строки | Паттерн |
|--------|--------|---------|
| `blur` | 935-943 | special + abstract + custom + baseFilter |
| `brightness` | 945-950 | special + abstract + custom + baseFilter |
| `contrast` | 952-957 | special + abstract + custom + baseFilter |
| `grayscale` | 970-975 | special + abstract + custom + baseFilter |
| `hue-rotate` | 977-982 | special + abstract + custom + baseFilter |
| `invert` | 984-989 | special + abstract + custom + baseFilter |
| `sepia` | 991-996 | special + abstract + custom + baseFilter |
| `saturate` | 998-1003 | special + abstract + custom + baseFilter |

**Повторяющийся код:**
```typescript
// Этот паттерн повторяется 8 раз!
FILTER: {
  reg: new RegExp(
    `(?<style>FILTER)-((?<special>VALUES)\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`
  ),
  getValue(classStyle) {
    const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
    return `--fv-FILTER: FUNCTION(${custom(groups) ?? value});\n  ${baseFilter}`
  }
}
```

**Дублирование:** ~8 строк × 8 фильтров = **~64 строки**

---

### 3. BACKDROP-FILTER ПРАВИЛА (ВЫСОКОЕ ДУБЛИРОВАНИЕ - 90%)

Повторяющаяся структура для **8 backdrop-фильтров:**

| Фильтр | Строки | Паттерн |
|--------|--------|---------|
| `backdrop-blur` | 1005-1013 | Точно как blur но с backdrop- |
| `backdrop-brightness` | 1015-1022 | Точно как brightness но с backdrop- |
| `backdrop-contrast` | 1024-1029 | Точно как contrast но с backdrop- |
| `backdrop-grayscale` | 1031-1036 | Точно как grayscale но с backdrop- |
| `backdrop-hue-rotate` | 1038-1045 | Точно как hue-rotate но с backdrop- |
| `backdrop-invert` | 1047-1052 | Точно как invert но с backdrop- |
| `backdrop-sepia` | 1054-1059 | Точно как sepia но с backdrop- |
| `backdrop-saturate` | 1061-1066 | Точно как saturate но с backdrop- |
| `backdrop-opacity` | 1068-1074 | Специальный случай |

**Дублирование:** ~8 строк × 8 фильтров = **~64 строки**

---

### 4. SIZING ПРАВИЛА (СРЕДНЕЕ ДУБЛИРОВАНИЕ - 60%)

Повторяющаяся структура для **7 свойств:**

| Свойство | Строки | Особенности |
|----------|--------|-------------|
| `w` | 76-82 | Базовое |
| `min-w` | 84-90 | Аналогично w |
| `max-w` | 92-97 | Аналогично w + дополнительные значения |
| `h` | 99-104 | Аналогично w |
| `min-h` | 106-111 | Аналогично w |
| `max-h` | 113-118 | Аналогично w + дополнительные значения |
| `size` | 120-129 | Уникальное (width + height) |

**Повторяющийся код:**
```typescript
// Повторяется 6 раз с минимальными вариациями
PROPERTY: {
  styleName: "CSS-PROPERTY",
  reg: /(?<style>PREFIX)-((?<special>VALUES)|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
  getValue(classStyle) {
    const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
    return `CSS-PROPERTY: ${custom(groups) ?? sizing(groups) ?? ""};`
  }
}
```

**Дублирование:** ~6 строк × 7 свойств = **~42 строки**

---

### 5. TRANSFORM ПРАВИЛА (СРЕДНЕЕ ДУБЛИРОВАНИЕ - 50%)

| Transform | Строки | Паттерн |
|-----------|--------|---------|
| `scale` | 1108-1113 | Axis + baseTransform |
| `rotate` | 1115-1120 | Простое значение + baseTransform |
| `translate` | 1122-1127 | Axis + baseTransform |
| `skew` | 1129-1134 | Axis + baseTransform |
| `origin` | 1136-1147 | Уникальное |

**Дублирование:** ~20 строк

---

### 6. GRADIENT ПРАВИЛА (ВЫСОКОЕ ДУБЛИРОВАНИЕ - 85%)

| Градиент | Строки | Паттерн |
|----------|--------|---------|
| `from` | 499-539 | Почти идентичный |
| `via` | 541-581 | Почти идентичный |
| `to` | 584-624 | Почти идентичный |

**Повторяющийся код:**
```typescript
// Этот паттерн повторяется 3 раза с минимальными различиями!
GRADIENT: {
  reg: {
    abstract: /(?<style>GRADIENT)-(\[(?<abstract>.*?)])\/...,
    color: /(?<style>GRADIENT)-(?<special>COLORS)...,
    specialColor: /(?<style>GRADIENT)-(?<special>SPECIAL_COLORS)...,
    position: /(?<style>GRADIENT)-(?<special>\d+%)/
  },
  getValue(classStyle) {
    // Почти идентичная логика для from/via/to
    // Различается только формат CSS переменных
  }
}
```

**Дублирование:** ~40 строк × 3 = **~120 строк**

---

### 7. ПРОСТЫЕ ENUM ПРАВИЛА (НИЗКОЕ ДУБЛИРОВАНИЕ - 30%)

Множество простых правил с enum значениями:

| Правило | Строки | Тип |
|---------|--------|-----|
| `whitespace` | 286-292 | Простой enum |
| `hyphens` | 326-332 | Простой enum |
| `break-after` | 294-300 | Enum с vendor prefix |
| `break-before` | 302-308 | Enum с vendor prefix |
| `break-inside` | 310-316 | Enum с vendor prefix |
| `appearance` | 1186-1192 | Enum с vendor prefix |
| И еще ~20 подобных... | - | - |

---

## 📈 Статистика дублирования

| Категория | Правил | Строк кода | % Дублирования | Потенциал экономии |
|-----------|--------|------------|----------------|-------------------|
| **Цветовые** | 15 | ~900 | **85%** | ~750 строк |
| **Filters** | 8 | ~64 | **90%** | ~55 строк |
| **Backdrop-filters** | 9 | ~72 | **90%** | ~65 строк |
| **Gradients** | 3 | ~120 | **85%** | ~100 строк |
| **Sizing** | 7 | ~50 | **60%** | ~30 строк |
| **Transforms** | 4 | ~25 | **50%** | ~12 строк |
| **Simple enum** | ~20 | ~150 | **30%** | ~45 строк |
| **Остальное** | ~10 | ~445 | ~20% | ~90 строк |
| **ИТОГО** | **~75** | **~1,826** | **~62%** | **~1,147 строк** |

---

## 🎯 Топ-10 паттернов для рефакторинга

### #1 - Цветовые правила с opacity (15 правил, ~900 строк)

**Общий паттерн:**
```typescript
{
  reg: {
    abstract: RegExp, // Для [#hex] и [value]
    color: RegExp,    // Для color-tone/opacity
    specialColor: RegExp  // Для inherit/current/transparent/black/white
  },
  getValue() {
    // Проверка abstract → color → specialColor
    // Применение addAlphaToHex для opacity
    // Возврат CSS свойства
  }
}
```

**Можно заменить на:**
```typescript
function createColorRule(prefix: string, cssProperty: string, options?) {
  return {
    reg: generateColorRegexes(prefix),
    getValue: createColorGetValue(cssProperty, options)
  }
}

// Использование:
text: createColorRule("text", "color"),
bg: createColorRule("bg", "background-color"),
border: createColorRule("border", "border-color"),
// ... еще 12 свойств
```

**Экономия: ~750 строк (83%)**

---

### #2 - Filter правила (8 правил, ~64 строки)

**Общий паттерн:**
```typescript
{
  reg: /(?<style>FILTER)-((?<special>VALUES)|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
  getValue(classStyle) {
    const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
    return `--fv-FILTER: FUNCTION(VALUE);\n  ${baseFilter}`
  }
}
```

**Можно заменить на:**
```typescript
function createFilterRule(name: string, cssFunction: string, specialValues?) {
  return {
    reg: generateFilterRegex(name, specialValues),
    getValue: createFilterGetValue(name, cssFunction, baseFilter)
  }
}

// Использование:
blur: createFilterRule("blur", "blur", blurValues),
brightness: createFilterRule("brightness", "brightness"),
contrast: createFilterRule("contrast", "contrast"),
// ... еще 5 фильтров
```

**Экономия: ~55 строк (85%)**

---

### #3 - Backdrop-filter правила (9 правил, ~72 строки)

**Точно такой же паттерн как filter, но с `backdrop-` префиксом и `baseBackdropFilter`**

```typescript
function createBackdropFilterRule(name: string, cssFunction: string, specialValues?) {
  return createFilterRule(`backdrop-${name}`, cssFunction, specialValues, baseBackdropFilter)
}

// Использование:
"backdrop-blur": createBackdropFilterRule("blur", "blur", blurValues),
"backdrop-brightness": createBackdropFilterRule("brightness", "brightness"),
// ... еще 7 фильтров
```

**Экономия: ~65 строк (90%)**

---

### #4 - Gradient правила (3 правила, ~120 строк)

**Повторяющаяся структура for from/via/to:**
```typescript
// from, via, to имеют почти идентичный код
{
  reg: {
    abstract, color, specialColor, position
  },
  getValue() {
    // Различается только формат CSS переменных
    // from: --fv-gradient-from: COLOR var(--fv-gradient-from-position)
    // via:  --fv-gradient-stops: var(--fv-gradient-from), COLOR var(--fv-gradient-via-position), var(--fv-gradient-to)
    // to:   --fv-gradient-to: COLOR var(--fv-gradient-to-position)
  }
}
```

**Можно заменить на:**
```typescript
function createGradientRule(type: "from" | "via" | "to") {
  return {
    reg: generateColorRegexes(type),
    getValue: createGradientGetValue(type)
  }
}

// Использование:
from: createGradientRule("from"),
via: createGradientRule("via"),
to: createGradientRule("to")
```

**Экономия: ~100 строк (83%)**

---

### #5 - Sizing правила (7 правил, ~50 строк)

**Повторяющийся паттерн:**
```typescript
PROPERTY: {
  styleName: "CSS-PROPERTY",
  reg: /(?<style>PREFIX)-(VALUES)/,
  getValue(classStyle) {
    const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
    return `CSS-PROPERTY: ${custom(groups) ?? sizing(groups) ?? ""};`
  }
}
```

**Можно заменить на:**
```typescript
function createSizingRule(prefix: string, cssProperty: string, specialValues?: string[]) {
  return {
    reg: generateSizingRegex(prefix, specialValues),
    getValue: (classStyle: string) => {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `${cssProperty}: ${custom(groups) ?? sizing(groups) ?? ""};`
    }
  }
}

// Использование:
w: createSizingRule("w", "width", extraValues),
h: createSizingRule("h", "height", extraValues),
"min-w": createSizingRule("min-w", "min-width"),
// ... еще 4 свойства
```

**Экономия: ~30 строк (60%)**

---

### #6 - Transform правила с axis (3 правила, ~25 строк)

**Паттерн scale/translate/skew:**
```typescript
{
  reg: /(?<style>TRANSFORM)-(?<axis>[xy])?-?(VALUES)/,
  getValue(classStyle) {
    const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
    return transformAxisHelper[groups.axis](value) // Возвращает CSS для x, y или обоих
  }
}
```

**Можно заменить на:**
```typescript
function createTransformAxisRule(name: string, cssVar: string, valueTransform?) {
  return {
    reg: generateTransformRegex(name),
    getValue: createTransformGetValue(cssVar, valueTransform, baseTransform)
  }
}
```

**Экономия: ~15 строк (60%)**

---

### #7 - Spacing правила (m/p, 2 правила, ~20 строк)

**m и p почти идентичны:**
```typescript
m: {
  styleName: "margin",
  reg: /(?<negative>-)?(?<style>m)(?<axis>[xyserltb])?-(VALUES)/,
  getValue(classStyle) {
    return positionPaddingOrMargin[groups.axis](this.styleName, value)
  }
}

p: {
  styleName: "padding",
  reg: /(?<style>p)(?<axis>[xyserltb])?-(VALUES)/, // Только m имеет negative
  getValue(classStyle) {
    return positionPaddingOrMargin[groups.axis](this.styleName, value)
  }
}
```

**Можно заменить на:**
```typescript
function createSpacingRule(prefix: string, cssProperty: string, allowNegative = false) {
  return {
    styleName: cssProperty,
    reg: generateSpacingRegex(prefix, allowNegative),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return positionPaddingOrMargin[groups.axis](this.styleName ?? "", custom(groups) ?? sizing(groups) ?? "")
    }
  }
}

m: createSpacingRule("m", "margin", true),  // с negative
p: createSpacingRule("p", "padding", false) // без negative
```

**Экономия: ~10 строк (50%)**

---

### #8 - Простые enum правила (~20 правил, ~150 строк)

**Повторяющийся паттерн:**
```typescript
PROPERTY: {
  reg: /(?<style>PROPERTY)-(?<special>VALUE1|VALUE2|VALUE3)\b/,
  getValue(classStyle) {
    const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
    if (!groups?.special) return
    return `CSS-PROPERTY: ${groups.special};`
  }
}
```

**Примеры:**
- `whitespace` (строки 286-292)
- `hyphens` (строки 326-332)
- `appearance` (строки 1186-1192)
- `pointer-events` (строки 1240-1246)
- `select` (строки 1314-1320)
- И еще ~15 подобных

**Можно заменить на:**
```typescript
function createEnumRule(prefix: string, cssProperty: string, values: string[], valueTransform?) {
  return {
    reg: new RegExp(`(?<style>${prefix})-(?<special>${values.join("|")})\\b`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      const value = valueTransform ? valueTransform(groups.special) : groups.special
      return `${cssProperty}: ${value};`
    }
  }
}

// Использование:
whitespace: createEnumRule("whitespace", "white-space", ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"]),
hyphens: createEnumRule("hyphens", "hyphens", ["none", "manual", "auto"]),
// ... еще 18 свойств
```

**Экономия: ~45 строк (30%)**

---

### #9 - Vendor prefix правила (4 правила, ~40 строк)

**Паттерн с вендорными префиксами:**
```typescript
{
  reg: /(?<style>PROPERTY)-(?<special>VALUES)\b/,
  getValue(classStyle) {
    const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
    return `-webkit-PROPERTY: ${value};\n  -moz-PROPERTY: ${value};\n  PROPERTY: ${value};`
  }
}
```

**Примеры:**
- `break-after`, `break-before`, `break-inside` (колонки)
- `appearance`
- `box-decoration`

**Можно заменить на:**
```typescript
function createVendorPrefixRule(prefix: string, cssProperty: string, values: string[], vendors = ["-webkit-", "-moz-", ""]) {
  return {
    reg: new RegExp(`(?<style>${prefix})-(?<special>${values.join("|")})\\b`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      return vendors.map(v => `${v}${cssProperty}: ${groups.special};`).join("\n  ")
    }
  }
}
```

**Экономия: ~20 строк (50%)**

---

### #10 - Border/Outline/Ring правила (сложные, ~200 строк)

Эти правила имеют сложную структуру с multiple sub-регулярками, но также содержат повторения для цветов.

**Паттерн:**
- Border, Outline, Ring все имеют варианты с цветами (используют одинаковый код)
- Можно выделить общие части

**Экономия: ~50 строк (25%)**

---

## 💡 Предлагаемое решение

### Создать фабричные функции:

1. **`createColorRule()`** - для всех цветовых свойств (15 правил)
2. **`createFilterRule()`** - для всех filter свойств (8 правил)
3. **`createBackdropFilterRule()`** - для всех backdrop-filter свойств (9 правил)
4. **`createGradientRule()`** - для from/via/to (3 правила)
5. **`createSizingRule()`** - для w/h/min/max (7 правил)
6. **`createEnumRule()`** - для простых enum правил (~20 правил)
7. **`createVendorPrefixRule()`** - для правил с вендорными префиксами (4 правила)
8. **`createTransformAxisRule()`** - для scale/translate/skew (3 правила)

### Ожидаемый результат:

```
БЫЛО:     1,826 строк
СТАНЕТ:   ~700-900 строк (создание фабрик + их использование)
ЭКОНОМИЯ: ~900-1,100 строк (50-60%)
```

---

## 🚀 Следующие шаги

1. Создать файл `unoRules.factories.ts` с фабричными функциями
2. Создать файл `unoRules.utils.ts` с утилитами для regex генерации
3. Переписать `unoRules.ts` с использованием фабрик
4. Протестировать что все работает
5. Сравнить результаты

---

**Готов начать рефакторинг? 🚀**

