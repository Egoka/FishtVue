---
title: Migration guide
summary: Breaking changes major-релиза 1.0.0 и как через них пройти. §1–§8 — закрытие аудит-сводки: переименование Aria → Textarea, снятые deprecated-алиасы, дифференциация встроенных тем, semantic-слоты интентов, поле name в пресетах, диалект uno-движка. §9–§15 — редизайн публичного API props: class только корень, карта classes вместо classX/styles/*Class, positive-булевы, имена концептов, события, типы без Hungarian, data-* селекторы.
updated: 2026-09-14
---

# Migration guide

Библиотека выпускает **один глобальный major** после закрытия аудит-сводки, а не серию мелких breaking-релизов (решение R5). Поэтому все ломающие изменения собраны здесь, в одном месте.

Guide состоит из двух блоков, и они очень разные по объёму работы:

- **§1–§8 — закрытие аудит-сводки.** Переименование `Aria` → `Textarea`, снятые deprecated-алиасы, дифференциация тем, диалект uno-движка. Почти всё — либо механическая замена, либо пункты, не требующие действий вовсе. Пятнадцать-двадцать минут на типовое приложение, из которых бо́льшая часть уходит на импорты `Aria` и поиск обработчиков `@delete` у Badge.
- **§9–§15 — редизайн публичного API props (1.0.0).** Единственный в major заход на то, чтобы привести к одному виду адресацию классов, имена props, булевы, события и типы во всех 23 компонентах. Объём здесь зависит не от размера приложения, а от того, насколько глубоко оно лезло внутрь компонентов: код, пользовавшийся только `class` на корне и документированными props, правится за час; код, державший карты `styles` у Table и Menu, — заметно дольше.

Проходить имеет смысл сверху вниз за один заход: пункты не зависят друг от друга, но `vue-tsc` после каждого блока даёт разный набор ошибок, и разбирать их проще порциями.

## 1. `Aria` → `Textarea` — обязательно

Компонент назывался `Aria` по отсылке к WAI-ARIA, а на деле является обёрткой над `<textarea>`. Имя нарушало принцип наименьшего удивления: разработчик искал «общую a11y-абстракцию», а получал многострочное поле ввода — и, что хуже, поиск по слову «textarea» в документации не находил ничего.

**Deprecated-алиаса нет намеренно.** Алиас — это второй публичный путь к тому же компоненту, который надо поддерживать, тестировать и однажды удалять вторым breaking change'ем. Разумнее сломать один раз, дав миграции инструмент.

### Что менять

```diff
- import Aria from "fishtvue/aria"
+ import Textarea from "fishtvue/textarea"

- import type { AriaProps, AriaEmits, AriaExpose } from "fishtvue/aria"
+ import type { TextareaProps, TextareaEmits, TextareaExpose } from "fishtvue/textarea"
```

```diff
  <template>
-   <Aria v-model="message" label="Сообщение" :rows="5" />
+   <Textarea v-model="message" label="Сообщение" :rows="5" />
  </template>
```

Глобальная конфигурация:

```diff
  app.use(FishtVue, {
    componentsOptions: {
-     Aria: { rows: 5, wrap: "soft" }
+     Textarea: { rows: 5, wrap: "soft" }
    }
  })
```

Схема поля в [Form](./components/form.md):

```diff
  {
-   typeComponent: "Aria",
+   typeComponent: "Textarea",
    name: "comment"
  }
```

В Nuxt с auto-import — просто `<Textarea>` (или `<FvTextarea>`, если задан `prefix`).

### Автоматизация

Замена механическая и полностью покрывается поиском по проекту. Регулярные выражения ниже безопасны: они не задевают ARIA-атрибуты (`aria-label`, `aria-describedby`) — те пишутся строчными буквами через дефис.

```bash
# спецификаторы модуля
rg -l 'fishtvue/aria' src | xargs sed -i '' 's#fishtvue/aria#fishtvue/textarea#g'

# идентификаторы: Aria, AriaProps, AriaEmits, AriaExpose, AriaOption, AriaSlots
rg -l '\bAria' src | xargs sed -i '' -E 's/(^|[^A-Za-z0-9_-])Aria([A-Z]|\b)/\1Textarea\2/g'
```

После замены стоит проверить два места, где слово «Aria» могло означать не компонент: собственные комментарии про WAI-ARIA и строки в тестах вида `describe("Aria attributes")`.

Отдельного codemod-пакета не публикуется: правило — одна безусловная замена идентификатора, и `sed`/IDE-refactor справляются с ним не хуже AST-инструмента, зато без установки зависимости.

## 2. Deprecated-алиасы сняты — обязательно, если использовались

Шесть алиасов существовали ради обратной совместимости и предупреждали в dev-режиме. Все сняты одной волной (решение R7): каждый был вторым публичным входом к тому же поведению, и держать их до следующего breaking-релиза значило бы поддерживать два контракта параллельно.

| Что снято | Замена | Что будет, если оставить старое |
| --------- | ------ | -------------------------------- |
| `<Icons stile-icon="solid">` | `variant="solid"` | Атрибут игнорируется, вариант резолвится дефолтом (`outline`) |
| `<Button icon-position="left" \| "right">` | `"start"` / `"end"` | Сводится к `"end"` — иконка встаёт в дефолтную позицию, а не исчезает |
| `<Separator content-position="left" \| "right">` | `"start"` / `"end"` | Сводится к `"center"` — обе линии на месте |
| `<Alert position="left" \| "top-right" \| …>` | `"start"` / `"top-end"` / … | Не проходит allow-list → дефолтный `"top"` |
| `<Badge @delete>` | `@close` | **Обработчик не вызовется.** Единственный пункт, который ломается молча |
| `IDataItem.marker` в `:data-select` | scoped slot `#marker` | Поле игнорируется (так было с 2026-05-11), но исчезло из типа |
| Ключи локали `select.resultsCountOne` / `resultsCountNone` | `select.resultsCount` с CLDR-формами | Ключи не читаются с Wave 3.5 |

Резолв **намеренно сводит неизвестное значение к дефолту**, а не к пустой разметке: untyped JS-потребитель, оставшийся на старом `"left"`, получит иконку в другой позиции — заметно, но не сломано. Исключение — `@delete` у Badge: событие просто перестало эмититься, и это единственное место, требующее внимательного поиска по проекту.

```bash
rg '@delete|v-on:delete' src   # обработчики Badge
rg 'stile-icon|stileIcon' src
rg 'icon-position="(left|right)"|iconPosition: *"(left|right)"' src
rg 'content-position="(left|right)"' src
rg 'position="(left|right|top-left|top-right|bottom-left|bottom-right)"' src
```

## 3. Встроенные темы получили разные цвета — проверить визуально

До этого релиза Aurora, Harmony и Sapphire были **идентичны**: все три делили один объект `semantic` с `customThemeColor: 0`, то есть брендовый слот у всех был серым, а различались темы только полем `name`.

Теперь каждая задаёт собственный оттенок:

| Тема | `customThemeColor` | `customThemeColorContrast` |
| ---- | ------------------ | -------------------------- |
| Aurora (default) | `25deg` (тёплый) | `88%` |
| Harmony | `152deg` (зелёный) | `56%` |
| Sapphire | `217deg` (синий) | `84%` |

**Что это значит на практике.** Если приложение использовало классы `theme-*` (`bg-theme-500`, `text-theme-700`) и **не** задавало `customThemeColor` явно — они были серыми, а станут цветными. Это не регрессия, а то, чем встроенные темы должны были быть с самого начала, но изменение заметное.

Вернуть прежний нейтральный вид можно одной строкой:

```ts
app.use(FishtVue, {
  theme: { semantic: { customThemeColor: 0, customThemeColorContrast: 0 } }
})
```

Приложения, задававшие `customThemeColor` своим значением, не затронуты: пользовательская настройка по-прежнему выигрывает.

## 4. Поле `name` убрано из пресетов темы

Пресеты (`Aurora`, `Harmony`, `Sapphire`) несли поле `name`, которого нет в типе темы — оно проносилось через type assertion. Теперь идентичность активной темы живёт в `config.optionsTheme.nameTheme`, где типизирована.

```diff
- const active = useFishtVue()?.config.theme?.name
+ const active = useFishtVue()?.config.optionsTheme?.nameTheme
```

Значение **нормализуется**: если в `nameTheme` передано неизвестное имя, в конфиге окажется `"Aurora"` — та тема, которая фактически применилась, а не то, что было написано.

## 5. Semantic-слоты интентов

В палитру добавлены четыре именованных цвета — `success`, `warning`, `info`, `error`. Дефолты равны `green` / `yellow` / `blue` / `red`, поэтому **внешний вид не изменился**, и действий не требуется.

Действие нужно в одном случае: если тема переопределяла `primitive.green` (или `red`/`yellow`/`blue`) **ради того**, чтобы перекрасить Alert. Теперь это делается точнее и без побочных эффектов на остальные места, где использовались те же палитры:

```diff
  updatePreset({
    primitive: {
-     red: myBrandRedScale
+     error: myBrandRedScale
    }
  })
```

## 6. Спиннеры Loading наследуют цвет текста

Epic- и SVG-спиннеры содержали захардкоженные `#ff1d5e` / `#fff` в CSS-фолбэках и дефолтах prop'а `color`. Все переведены на `currentColor`.

На штатном пути изменений нет — `Loading` резолвит цвет из палитры и прокидывает его инлайн-стилем. Разница видна там, где инлайн-стиль не доезжает: SSR-снимок до гидратации и прямой импорт спиннера из `fishtvue/loading/epic/*`. Раньше там был розовый, теперь — цвет текста.

## 7. Диалект uno-движка: расширения без изъятий

Движок доведён до паритета с Tailwind v4 по вариантам и утилитам. Все изменения **аддитивные** — классы, работавшие раньше, работают так же. Три момента, о которых стоит знать:

- **`@sm:` теперь container query, а не viewport-медиа.** Раньше символ `@` не участвовал в разборе, `sm` матчился обычным breakpoint'ом, и класс давал `@media (min-width: 640px)`. Если в проекте есть `@sm:`/`@md:`-классы, написанные в расчёте на это поведение, они изменят смысл. Проверить стоит: это единственный случай, где вывод старого класса стал другим, а не появился новый.
- **`!important` теперь действительно работает.** `!mt-4` и `mt-4!` раньше экранировались в селектор без добавления `!important` — то есть класс молча не имел заявленного приоритета. Если на это поведение кто-то опирался (например, ожидал, что `!`-класс *не* перебьёт другой), приоритет изменится.
- **`**:` — все потомки, а не прямые дети.** Раньше давал `> *`, то есть то же, что `*:`.

Полная таблица диалекта — [architecture/theme.md §3.1](./architecture/theme.md).

## 8. `<html dir>` выставляется автоматически

При `install()` и при каждом `setActiveLocale()` библиотека синхронизирует `dir` на корневом элементе документа с направлением письма локали.

Действий не требуется, если приложение не управляет `dir` само. Если управляет — библиотека **не перетирает** уже выставленное значение: признак «атрибут наш» хранится в `data-fv-dir`, и чужой `dir` остаётся как есть.

---

## Редизайн props 1.0.0 — как читать §9–§15

Параграфы ниже описывают второй блок этого major'а — единственный заход на то, чтобы привести к одному виду адресацию классов, имена props, булевы, события и типы во всех 23 компонентах. До 1.0.0 «внутренний class-хук» существовал в трёх несовместимых формах: плоские `classX`, bag `styles` у Table/Menu/Split и суффиксные `*Class`. Теперь форма одна.

**С чего начать.** Большинство пунктов §9–§15 громкие: TS-потребитель получает ошибку компиляции, JS-потребитель — лишний атрибут на корне и поведение по умолчанию. Их найдёт `vue-tsc`, поэтому отдельно искать их не нужно. Тихих класса ровно три, и начинать имеет смысл с них:

| Тихий класс | Где | Почему компилятор молчит |
| ----------- | --- | ------------------------ |
| `class` сменил элемент | §9, шесть компонентов | Имя prop'а и тип не изменились — меняется только то, на какой элемент приезжают классы |
| Переименованные события | §14 | Незнакомый `@on-click` — это обычный listener в `$attrs`, а не ошибка |
| Payload `toggle` у Accordion | §14 | Имя события то же, обработчик вызывается — другой становится форма аргумента |

Всё остальное само себя обнаружит на первом же typecheck.

## 9. `class` теперь всегда корень компонента

У шести компонентов `class` адресовал **внутренний** элемент, а корень настраивался через `classBody`. Инверсия снята: `class` везде означает ровно то же, что и на нативном теге, — элемент, на котором он написан.

| Компонент | `class` уходил на | `class` теперь | Прежний элемент адресуется |
| --------- | ----------------- | -------------- | ------------------------- |
| [Icons](./components/icons.md) | `<svg>` | корень `[data-icon]` (`<i>`) | `classes.icon` |
| [Label](./components/label.md) | `<span>` с текстом | корень `[data-label]` | `classes.text` |
| [InputLayout](./components/input-layout.md) | внутренний блок `[data-input-layout-base]` | корень `[data-input-layout]` | `classes.base` |
| [Dialog](./components/dialog.md) | карточка `[data-dialog-content]` | корень `[data-dialog]` | `classes.content` |
| [FixWindow](./components/fix-window.md) | окно `[data-fix-window-content]` | корень `[data-fix-window]` | `classes.content` |
| [Alert](./components/alert.md) | карточка `[data-alert-body]` | корень `[data-alert]` | `classes.body` |

Вместе с инверсией снят и сам `classBody` — у Dialog, FixWindow, InputLayout и Label он был именем корня:

| Что снято | Замена | Что будет, если оставить старое |
| --------- | ------ | -------------------------------- |
| `classBody` (Dialog, FixWindow, InputLayout, Label) | `class` | Prop не объявлен → уходит в `$attrs` и оседает на корне атрибутом `class-body="…"`; классы не применяются |

Заодно переехала база Icons. Раньше размер, цвет и `shrink-0` висели на `<svg>`, а корневой `<i>` был пустым; теперь база — на `<i>`, а `<svg>` получает только `block h-full w-full` (решение 6). Если иконка переопределялась через `class="w-4 h-4"`, поведение не изменится — класс по-прежнему выигрывает twMerge, просто на элемент выше.

> **Это единственный визуальный break, который не диагностируется инструментами.** Имя prop'а прежнее, тип прежний — ни ошибки typecheck, ни постороннего атрибута в разметке. Код компилируется, рендерится и выглядит иначе. Шесть компонентов выше стоит просмотреть глазами, а не поиском.

```bash
# 1. classBody — снят везде
rg -n 'class-body=|:class-body=|classBody' src

# 2. class у шести компонентов со сменившимся элементом — проверить визуально
rg -n '<(Icons|Label|InputLayout|Dialog|FixWindow|Alert)\b[^>]*\bclass=' src
```

## 10. Внутренние элементы — только через `classes`

Единственный способ адресовать элемент внутри компонента — карта `classes?: ClassesMap<XClassKey>`. Ключ `root` — тот же элемент, что и `class` (`class` применяется последним). Набор ключей компонента экспортируется типом `{Name}ClassKey` и перечислен в §5.1 его документа.

**Почему не объект в `class`.** Исходной идеей был один prop, принимающий строку или карту. Это невозможно: `_createVNode` прогоняет `props.class` через `normalizeClass` для любого vnode до вычисления `shapeFlag`, и объект схлопывается в строку truthy-ключей — `{ index: "px-2" }` превращается в `"index"`. Поэтому структурированный хук живёт под отдельным именем (решение 1, прецедент — `classes` у MUI).

**Два рода ключей.** *Element* — аддитивные: база компонента, слой `componentsOptions` и prop склеиваются через twMerge, конфликт выигрывает последний. *Aspect* — заменяющие: `props ?? options ?? default`, пустая строка выключает оформление. Aspect-ключи: `mark`, `rowActive`, `rowHover`, `itemActive`, `itemSelected`, `animation`, `border*`.

| Что снято | Замена | Что будет, если оставить старое |
| --------- | ------ | -------------------------------- |
| Accordion `classItem` / `classTitle` / `classSubtitle` | `classes.item` / `.title` / `.panel` | Атрибут на корне, классы не применяются |
| Badge `classContent` | `classes.content` | То же |
| Button `classIcon` | `classes.icon` | То же |
| Calendar `classDataPicker` / `classDateText` / `classPicker` | `classes.control` / `.text` / `.picker` | То же |
| Input `classInput` / `passwordToggleClass` | `classes.control` / `.passwordToggle` | То же |
| Textarea `classInput` | `classes.control` | То же |
| Select `classSelect` / `classSelectList` / `classMaskQuery` | `classes.control` / `.list` / `.mark` | То же |
| Separator `classBodyLine` / `classBodyLineLeft` / `classBodyLineRight` | `classes.segment` / `.segmentStart` / `.segmentEnd` | То же |
| Separator `classLine` / `classLineLeft` / `classLineRight` | `classes.line` / `.lineStart` / `.lineEnd` | То же |
| Separator `classContent` | `classes.content` | То же |
| VirtualScroller `classContent` | `classes.content` | То же |
| Form `structureClass` / `structureClassGrid` | `classes.section` / `.grid` | То же |
| Form-схема: `Field.classCol`, `FormFieldProps.classCol` | `classes.field` | Поле схемы игнорируется молча — это не атрибут, а объект данных |
| Form-схема: `FormStructure.classGrid`, `FormSectionProps.classGrid` | `classes.grid` | То же |

Ключи, которых раньше не было ни в каком виде (новые точки расширения, а не переезды): Alert `icon`/`content`/`title`/`subtitle`/`close`, Badge `point`/`close`, Button `loading`, Dialog `backdrop`/`close`, FixWindow `close`, Accordion `header`/`content`, Switch `control`/`label`/`help`, Form `footer`, Split `separatorIcon`/`overlay`, VirtualScroller `viewport`/`loader`, Table `body`/`th`/`cell`, Menu `itemIcon`/`itemTitle`/`itemInfo`.

```bash
# любой плоский class*-prop и суффиксный *Class в разметке и в объектах-схемах
rg -n '\bclass[A-Z]\w*\s*[:=]' src
rg -n '(:|\b)class-[a-z-]+=' src
rg -n 'passwordToggleClass|password-toggle-class|structureClass|structure-class' src
```

## 11. Bag `styles` растворён

Три компонента держали классы, размеры и флаги оформления в одном объекте `styles`. Bag снят целиком: классы ушли в `classes`, всё остальное — в top-level props. `deepMerge` слоёв `options`/`props` для bag'а исчез — карты сливаются по ключу.

**Table.** `styles.class.*`:

| Было | Стало |
| ---- | ----- |
| `styles.class.body` | `class` (корень) |
| `styles.class.toolbar` | `classes.toolbar` |
| `styles.class.slotHeader` | `classes.header` |
| `styles.class.slotFooter` | `classes.footer` |
| `styles.class.bodyTable` | `classes.viewport` |
| `styles.class.table` | `classes.table` |
| `styles.class.thead` / `tbody` / `tfoot` | `classes.thead` / `.tbody` / `.tfoot` |
| `styles.class.cellText` | `classes.td` |
| `styles.class.group` / `groupText` | `classes.group` / `.groupText` |
| `styles.class.pagination` | `classes.pagination` |

> **`cellText` означал два разных элемента.** На уровне таблицы `styles.class.cellText` приезжал на `<td>` — поэтому он стал `classes.td`. На уровне колонки `column.class.cellText` действительно адресовал контент внутри ячейки и остался `cellText` (`TableColumn.classes.cellText`). Если оба были заданы одинаковым значением в расчёте на «один и тот же элемент», после миграции они разойдутся — и это правильно.

Aspect-значения и не-классовые настройки:

| Было | Стало | Род |
| ---- | ----- | --- |
| `styles.maskQuery` | `classes.mark` | aspect |
| `styles.activeRow` | `classes.rowActive` | aspect |
| `styles.hoverRows` | `classes.rowHover` | aspect |
| `styles.animation` | `classes.animation` | aspect |
| `styles.border` (строка) / `styles.border.default` | `classes.border` | aspect |
| `styles.border.{table, header, filter, head, cell, summary, pagination, footer}` | `classes.borderTable`, `borderHeader`, `borderFilter`, `borderHead`, `borderCell`, `borderSummary`, `borderPagination`, `borderFooter` | aspect |
| `styles.isStripedRows` | `stripedRows` | top-level prop |
| `styles.horizontalLines` / `verticalLines` / `filterLines` | одноимённые top-level props | top-level prop |
| `styles.heightCell` | `cellHeight` | top-level prop |
| `styles.borderRadiusPx` | `borderRadius` | top-level prop |
| `styles.defaultWidthColumn` | `defaultColumnWidth` | top-level prop |
| `styles.width` / `styles.height` | `width` / `height` | top-level prop |

Двойственность `border` («строка ИЛИ объект») сохранена по смыслу: `classes.border` — общее значение для всех регионов, региональный ключ перебивает его. Пустая строка в любом из них отключает рамку.

**Menu.** `styles.class.body` → `class` (корень); `title`, `separator`, `separatorIcon`, `group`, `groupTitle`, `item`, `itemIcon`, `itemTitle`, `itemInfo` — одноимённые ключи `classes`; `styles.class.itemRightIcon` → `classes.itemEndIcon`. Aspect: `styles.animation` → `classes.animation`, `styles.activeRows` → `classes.itemActive`, `styles.selectedRows` → `classes.itemSelected`. Размеры: `styles.width` / `styles.height` → top-level `width` / `height`.

> **Тройственный тип aspect-значений сведён к канону.** `activeRows` и `selectedRows` принимали `StyleClass | boolean | undefined`, где `undefined` и `true` означали default, а `false` — «выключить». Теперь это обычный aspect-ключ: выключает пустая строка. `activeRows: false` → `classes.itemActive: ""`.

**Split.** `styles.panel` → `classes.panel`, `styles.separator` → `classes.separator`.

Типы `ITableStyles`, `ITableStylesClass`, `ITableStylesBorder`, `MenuStyles`, `MenuStylesPrivate`, `ISplitStyles` и `type border` удалены. Поле `styles` убрано и из `defineExpose` всех трёх компонентов.

```bash
rg -n ':styles=|:styles\.|\bstyles:\s*\{|styles\?\.' src
rg -n 'isStripedRows|heightCell|borderRadiusPx|defaultWidthColumn|maskQuery|activeRows|selectedRows|hoverRows|itemRightIcon' src
```

## 12. Булевы props

Канон: bare-positive имя без префиксов `is`/`not`/`without`/`no`/`show`/`use`, default — литерал в резолвере компонента. Каждый optional boolean объявлен с `undefined` в `withDefaults`: иначе Vue кастует отсутствующий prop в `false`, и слой `componentsOptions` становится недостижим.

**Инверсии — здесь нужно перевернуть и значение.** Механическое переименование даст противоположное поведение:

| Что снято | Замена | Default | Что будет, если оставить старое |
| --------- | ------ | ------- | -------------------------------- |
| Alert, Dialog `notAnimate` | `animated` | `true` | Атрибут на корне; анимация включена |
| Dialog `notCloseBackground` | `closeOnBackdrop` | `true` | Клик по подложке снова закрывает диалог |
| Dialog `withoutMargin` | `margin` | `true` | Отступы возвращаются |
| Select `noQuery` | `searchable` | `true` | Поле поиска снова показывается |
| Calendar `isNotCloseOnDateChange` | `closeOnSelect` | `true` | Picker снова закрывается по выбору даты |
| Split `separatorNotHoverOpacity` | `separatorFade` | `true` | Разделитель снова проявляется по hover |
| Pagination, `TablePagination` `isHiddenNavigationButtons` | `navigationButtons` | `true` | Кнопки навигации снова видны |

**Переименования без смены смысла** — значение переносится как есть. Колонка «Default» — то, что резолвится при отсутствии
prop'а; у полей `TableColumn` и `EditorCell` это не литерал, а настройка уровня таблицы, и такой она была до 1.0.0:

| Что снято | Замена | Default |
| --------- | ------ | ------- |
| InputLayout и семья (Input, Textarea, Select, Calendar, TextEditor) `isValue` | `hasValue` | `false` |
| Те же `isInvalid` | `invalid` (+ канал `update:invalid`) | `false` |
| Те же `clear` | `clearable` | `false` |
| Label `animate` | `animated` | `true` |
| Label `isRequired` | `required` | `false` |
| Pagination, `TablePagination` `isInfoText` / `isPageSizeSelector` | `infoText` / `pageSizeSelector` | `false` |
| Table `edit` / `search` / `resizedColumns` | `editable` / `searchable` / `resizableColumns` | `false` |
| `TableColumn` `isFilter` / `isSort` / `isResized` | `filterable` / `sortable` / `resizable` | наследуется от table-level `filter` / `sort` / `resizableColumns` |
| `EditorCell.isEdit` | `editable` | наследуется от table-level `editable` |
| `TableFilter.isClearAllFilter` | `clearAll` | `false` |
| Form-схема `isHidden` (`Field`, `FormStructure`, `FormFieldProps`, `FormSectionProps`) | `hidden` | `false` |
| `FieldCustom.isValue` | `hasValue` | `false` |
| Menu `useFirstLetter` | `firstLetter` | `false` |
| `MenuSeparator.isVisible` | `visible` | `true` |
| VirtualScroller `showLoader` | `loader` | `false` |
| `datePickerProps.isRange` | Calendar `range` | `false` |

Без изменений — они и так bare-positive: `disabled`, `loading`, `required`, `multiple`, `closeButton`, `point`, `selected`, `onlyIcons`, `byCursor`, `focusTrap`, `returnFocus`, `lazy`, `appendOnly`, `nativeSubmit`. Passthrough-поля v-calendar (`isDark`, `isRequired`, `popover.isInteractive` внутри `datePickerProps`) правилу не подчиняются — это чужой контракт, он оставлен как есть.

```bash
rg -n 'not-animate|notAnimate|not-close-background|notCloseBackground|without-margin|withoutMargin' src
rg -n 'no-query|noQuery|is-not-close-on-date-change|isNotCloseOnDateChange|separator-not-hover-opacity|separatorNotHoverOpacity' src
rg -n 'is-hidden-navigation-buttons|is-info-text|is-page-size-selector|show-loader|use-first-letter' src
rg -n '\b(is|not|without|no|show|use)[A-Z]\w*\s*[:=]' src   # общий невод по префиксам
```

## 13. Имена props

Пункты ниже — переименования концептов: Hungarian-нотация, `params*`-bag'и и имена, конфликтовавшие с соседними props. Поведение не меняется.

| Что снято | Замена | Компонент |
| --------- | ------ | --------- |
| `mode` | `variant` | Button, Badge |
| `modeStyle` / `modeLabel` | `mode` / `labelMode` | Form |
| `type` / `title` | `labelMode` / `label` | Label |
| `vertical: boolean` | `orientation: "horizontal" \| "vertical"` | Separator |
| `horizontal: boolean` | `orientation` | Menu |
| `direction` | `orientation` | Split |
| `toTeleport: string` | `teleport: TeleportTarget` | Alert, Dialog, FixWindow |
| `typePosition` / `delay` | `strategy` / `openDelay` | FixWindow |
| `delay` | `throttle` | VirtualScroller |
| `dataSource` | `items` | Accordion |
| `dataSelect` / `noData` / `closeButtonBadge` | `options` / `emptyText` / `badgeCloseButton` | Select |
| `totalCount` (+ `TableAsyncDataResult.totalCount`) | `total` | Table |
| `countVisibleRows` / `sizeLoadingRows` / `countDataOnLoading` | `visibleRows` / `loadingRows` / `loadingThreshold` | Table |
| `noData` / `noColumn` / `TableFilter.noFilter` | `emptyText` / `emptyColumnsText` / `emptyFilterText` | Table |
| `sizePage` / `sizesSelector` / `visibleNumberPages` | `pageSize` / `pageSizes` / `visiblePages` | Pagination |
| `paramsDatePicker` / `paramsFixWindow` | `datePickerProps` / `fixWindowProps` | Calendar, Select |
| `paramsWindowMenu` | `fixWindowProps` | Menu |
| `paramsDialog` / `paramsTextEditor` | `dialogProps` / `editorProps` | TextEditor |
| `paramsFilter` / `editorOptions` | `filterProps` / `editorProps` | `TableColumn` |
| `<FormField type>` | `typeComponent` | Form |
| `SelectGroup.label` | `title` | Select |

Два уточнения. `<FormField type>` снят не ради единообразия: он конфликтовал с `InputProps.type` — у поля было два дискриминатора, и какой из них победит, зависело от порядка ветвления. Остался один, `typeComponent`. У `SelectGroup` дублировались `label` и `title` с одинаковым смыслом; остался `title`.

Bag'и, пробрасываемые во вложенный компонент или библиотеку, теперь единообразно называются `{inner}Props` — `fixWindowProps`, `dialogProps`, `datePickerProps`, `filterProps`, `editorProps`. Префикс `params*` запрещён каноном.

```bash
rg -n 'params-(fix-window|date-picker|dialog|text-editor|filter|window-menu)|params[A-Z]' src
rg -n 'to-teleport|toTeleport|type-position|typePosition|data-select|dataSelect|total-count|totalCount' src
rg -n 'size-page|sizePage|sizes-selector|sizesSelector|visible-number-pages|visibleNumberPages' src
rg -n 'count-visible-rows|size-loading-rows|count-data-on-loading|no-column|no-data|no-filter' src
rg -n 'mode-style|modeStyle|mode-label|modeLabel|<Button[^>]*\bmode=|<Badge[^>]*\bmode=' src
rg -n '<SelectGroup[^>]*\blabel=' src
```

## 14. События — класс, который ломается молча

Незнакомый listener не вызывает ни ошибки, ни предупреждения: Vue кладёт его в `$attrs`, и обработчик просто никогда не вызывается. Проверить придётся поиском.

| Что снято | Замена | Компонент |
| --------- | ------ | --------- |
| `@on-click` / `@on-active` / `@on-inactive` | `@item-click` / `@item-active` / `@item-inactive` | Menu |
| `@is-active` | `@active` | Input, Select, Calendar |
| `@get-calendar` | `@ready` | Calendar |
| `@update:is-invalid`, `v-model:is-invalid` | `@update:invalid`, `v-model:invalid` | Input, Textarea, Select, Calendar, TextEditor |
| `@update:size-page`, `v-model:size-page` | `@update:page-size`, `v-model:page-size` | Pagination |
| `@switch-size-page` | `@switch-page-size` | Table |

Payload `update:invalid` сужен до `boolean` — раньше канал мог отдать `undefined`. У Pagination оба v-model-канала сужены до `number` по той же причине.

**Payload `toggle` у Accordion изменил форму.** Имя события прежнее, обработчик по-прежнему вызывается — меняется аргумент: вместо массива секций приходит `{ key, open, items }`. Прежнее значение доступно как `payload.items`, поэтому самая дешёвая миграция — распаковка на месте:

```diff
- <Accordion @toggle="(items) => sync(items)" />
+ <Accordion @toggle="({ items }) => sync(items)" />
```

Смысл в том, что по старому payload'у нельзя было понять, **что именно** переключилось: приходил весь набор, и потребителю оставалось сравнивать его с предыдущим. Теперь `key` и `open` отвечают на это прямо.

**Чего в событиях не появилось.** `change:modelValue` остаётся ровно у шести form-control'ов — Input, Textarea, Select, Calendar, TextEditor, Switch. Alert, Dialog, FixWindow и Pagination несут `update:modelValue` без парного `change:` намеренно: их канал передаёт состояние «открыт/закрыт» или номер страницы, у которых нет момента «значение устоялось», отличного от самого обновления. Контракт закреплён guard-тестом [emitsNaming.test.ts](../lib/emitsNaming.test.ts).

Поля-колбэки схемы Menu (`MenuItemData.onClick` / `onActive` / `onInactive`) переименования **не** касаются: это listener-props элемента схемы, а не события компонента `<Menu>`. Собственные события `<MenuItem>` — `click` / `active` / `inactive` — тоже не менялись.

```bash
rg -n '@on-click|@on-active|@on-inactive|v-on:on-|:on-click=' src
rg -n '@is-active|@get-calendar|@update:is-invalid|v-model:is-invalid' src
rg -n '@update:size-page|v-model:size-page|@switch-size-page' src
rg -n '@toggle' src   # Accordion: проверить форму payload'а
```

## 15. Типы и `data-*` селекторы

Hungarian-префикс `I` снят со всех экспортируемых типов, имена приведены к схеме `{Component}{Concept}`.

| Что снято | Замена | Модуль |
| --------- | ------ | ------ |
| `IColumn`, `IColumnPrivate` | `TableColumn`, `TableColumnPrivate` | Table |
| `ISummary`, `ISummaryPrivate` | `TableSummary`, `TableSummaryPrivate` | Table |
| `IToolbar`, `ISort`, `IFilter`, `IGrouping` | `TableToolbar`, `TableSort`, `TableFilter`, `TableGrouping` | Table |
| `IAsyncDataConfig`, `IAsyncDataParams`, `IAsyncDataResult` | `TableAsyncDataConfig`, `TableAsyncDataParams`, `TableAsyncDataResult` | Table |
| `ITableStyles`, `ITableStylesClass`, `ITableStylesBorder`, `border` | удалены (§11) | Table |
| `ItemMenu`, `ItemMenuPrivate` | `MenuItemData`, `MenuItemDataPrivate` | Menu |
| `GroupMenu`, `GroupMenuPrivate` | `MenuGroupData`, `MenuGroupDataPrivate` | Menu |
| `MenuItem` (тип), `MenuItemPrivate` | `MenuData`, `MenuDataPrivate` | Menu |
| `MenuFixWindow` | `MenuFixWindowProps` | Menu |
| `MenuStyles`, `MenuStylesPrivate` | удалены (§11) | Menu |
| `AccordionItem` (тип) | `AccordionItemData` | Accordion |
| `IDataItem` | `SelectDataItem` | Select |
| `SelectOptionProps`, `SelectOptionSlots` | `SelectItemProps`, `SelectItemSlots` | Select |
| `IParamsDatePicker`, `ICalendarPicker` | `DatePickerProps`, `CalendarPicker` | Calendar |
| `IMasksDate`, `IRangeDate`, `IRangeValue` | `CalendarMasks`, `CalendarRangeDate`, `CalendarRangeValue` | Calendar |
| `IQuillEditor`, `IDataTextEditor` | `TextEditorInstance`, `TextEditorQuillConfig` | TextEditor |
| `BaseAriaProps` | `BaseTextareaProps` | Textarea |
| `FieldAria` | `FieldTextarea` | Form |
| `classCol` | удалён (§10) | Form |
| `Size` | `PanelSize` | Split |
| `ISplitStyles` | удалён (§11) | Split |
| `FixWindowTeleport` | `TeleportTarget` (переехал в `fishtvue/types`) | FixWindow |
| `namesColors` | `ColorName` | Theme |
| `_key` | `ItemKey` | `fishtvue/types` |
| `setStyleOptions` | `SetStyleOptions` | `Component<T>` |
| `AccordionItemOption`, `MenuItemOption`, `MenuGroupOption` | удалены — мёртвые, в `ComponentsOptions` не входили | — |

Тип `_key` снят, но **поле** `_key` в строках Table осталось: оно сохраняется в `dataSource` и приходит в payload'ах шести событий (`add-row`, `delete-row`, `before-edit-row`, `after-edit-row`, `before-edit-cell`, `after-edit-cell`). Переименование поля — отдельный, куда более широкий break, и в этот major он не входит.

Переименование компонента: `<SelectOption>` → `<SelectItem>` (файл, класс, типы, Nuxt auto-import). Старое имя не резолвится — в Nuxt это ошибка компиляции шаблона, при явном импорте — ошибка резолва модуля.

```bash
# типы — одной заменой; порядок важен, длинные имена первыми
sed -E -i \
  -e 's/\bIColumnPrivate\b/TableColumnPrivate/g; s/\bIColumn\b/TableColumn/g' \
  -e 's/\bISummaryPrivate\b/TableSummaryPrivate/g; s/\bISummary\b/TableSummary/g' \
  -e 's/\bIAsyncDataConfig\b/TableAsyncDataConfig/g; s/\bIAsyncDataParams\b/TableAsyncDataParams/g; s/\bIAsyncDataResult\b/TableAsyncDataResult/g' \
  -e 's/\bIToolbar\b/TableToolbar/g; s/\bISort\b/TableSort/g; s/\bIFilter\b/TableFilter/g; s/\bIGrouping\b/TableGrouping/g' \
  -e 's/\bItemMenuPrivate\b/MenuItemDataPrivate/g; s/\bItemMenu\b/MenuItemData/g' \
  -e 's/\bGroupMenuPrivate\b/MenuGroupDataPrivate/g; s/\bGroupMenu\b/MenuGroupData/g' \
  -e 's/\bIDataItem\b/SelectDataItem/g; s/\bIParamsDatePicker\b/DatePickerProps/g; s/\bICalendarPicker\b/CalendarPicker/g' \
  -e 's/\bIMasksDate\b/CalendarMasks/g; s/\bIRangeDate\b/CalendarRangeDate/g; s/\bIRangeValue\b/CalendarRangeValue/g' \
  -e 's/\bIQuillEditor\b/TextEditorInstance/g; s/\bIDataTextEditor\b/TextEditorQuillConfig/g' \
  -e 's/\bBaseAriaProps\b/BaseTextareaProps/g; s/\bFieldAria\b/FieldTextarea/g; s/\bnamesColors\b/ColorName/g' \
  $(rg -l 'IColumn|ISummary|IAsyncData|IToolbar|ISort|IFilter|IGrouping|ItemMenu|GroupMenu|IDataItem|IParamsDatePicker|ICalendarPicker|IMasksDate|IRangeDate|IRangeValue|IQuillEditor|IDataTextEditor|BaseAriaProps|FieldAria|namesColors' src)

# компонент SelectOption и типы Menu/Accordion, у которых имя совпадает с компонентом, — вручную:
rg -n '\bSelectOption\b|\bMenuItem\b|\bAccordionItem\b' src
```

Последние три требуют внимания, а не `sed`: `MenuItem` и `AccordionItem` — по-прежнему **живые имена компонентов**, переименовались только одноимённые типы. `import { MenuItem } from "fishtvue/menu"` остаётся верным, а `const items: MenuItem[]` становится `MenuItemData[]`. Коллизия и была причиной переименования.

**`data-*`-селекторы.** Если приложение цеплялось к разметке компонентов из своих стилей или e2e-тестов:

| Было | Стало | Компонент |
| ---- | ----- | --------- |
| `[data-table-component]` | `[data-table]` | Table |
| `[data-table-header-slot]` | `[data-table-header]` | Table |
| `[data-table-scroll]` | `[data-table-viewport]` | Table |
| `[data-separator-left]` / `[data-separator-right]` | `[data-separator-start]` / `[data-separator-end]` | Separator |
| `[data-input-switch]` / `[data-input-checkbox]` | `[data-switch-button]` / `[data-switch-checkbox]` | Switch |
| `[data-direction]` | `[data-orientation]` | Split |
| `[data-select]`, `[data-input]`, `[data-calendar]` на контроле | остались на корне; контрол — `[data-select-control]`, `[data-input-control]`, `[data-calendar-control]` | Select, Input, Calendar |

Канон теперь такой: корень — `data-{kebab-name}`, внутренний элемент — `data-{kebab-name}-{key}`, где `{key}` совпадает с ключом `classes`. Имена логические (`start`/`end`), не физические (`left`/`right`), чтобы селектор не врал в RTL. Полный список маркеров компонента — в §5.1 его документа, колонка «Element»: ключи `classes` и суффиксы `data-*` совпадают по построению.

```bash
rg -n 'data-table-component|data-table-header-slot|data-table-scroll' src
rg -n 'data-separator-(left|right)|data-input-(switch|checkbox)|\[data-direction\]' src
rg -n '\[data-(input|select|calendar)\]' src   # проверить: корень или контрол
```

## Чего в этом релизе НЕ произошло

- **Calendar и TextEditor не переписаны.** Оба остаются на `v-calendar` и Quill, их API не менялся. Переписывание на собственные реализации — отдельный проект после этого релиза; открытые вопросы обоих компонентов заморожены до него ([issues/README.md](./issues/README.md), раздел «Заморожено до переписывания»).
- **Codemod-пакета нет.** Решение R8 оставляет его отдельным npm-пакетом после публикации 1.0.0; `lib/` не получает новых зависимостей. Рецепты `rg`/`sed` выше покрывают механическую часть, а два тихих класса (§9, §14 `toggle`) AST-инструмент всё равно не нашёл бы: там меняется не текст, а смысл.
- **Expose-поля не переименованы.** `classBase`, `isInvalid`, `isFocused` и прочее в `defineExpose` — это состояние компонента, а не его props; их имена вне контракта props. Исключение — `styles`, снятый из expose Table/Menu/Split вместе с самим bag'ом.
- **Асимметрии оставлены осознанно.** `rounded` у Button принимает токены, у Switch — пиксели; у Split своя пара событий изменения размеров; `focus`/`blur` есть у Input и Textarea, но не у Select/Calendar/TextEditor. Всё это зафиксировано в §18 соответствующих документов как известные отклонения, а не приведено к одному виду задним числом.
- **`sandbox-nuxt` и публичный сайт отстают.** Первый стоит на опубликованном `fishtvue@^0.2.x`, второй ведётся отдельно (R32) — примеры с `Aria` и старыми именами props на fisht.org какое-то время будут расходиться с библиотекой. Оба подтянутся после публикации 1.0.0.
