---
title: Closure assessment — оценка объёма до закрытия сводки компонентов
summary: Read-only аудит остатка работ по сводке компонентов (второй заход, 2026-09-05). Сверка Fix roadmap и issue-документов с фактическим кодом lib/, прогон typecheck/tests/coverage/prettier/eslint. Пересчёт матрицы по «Сводка»-таблицам, 22 позиции документационного дрейфа, 7 новых находок в коде, независимые батчи, эпики, breaking-изменения, волны с оценкой и критическим путём.
updated: 2026-09-05
---

# Closure assessment — оценка объёма до закрытия сводки компонентов

**Тип:** read-only аудит. Код и документация (кроме этого файла) не изменялись.
**Ветка:** `chore/claude-workflow-init`
**HEAD:** `9f6b683` (2026-08-02) — docs(issues): синхронизировать статусы Table/Alert/Loading/Accordion/Switch с lib/
**Предыдущий снимок:** 2026-08-02 на `9ef2cea` + незакоммиченный батч. Этот документ его **полностью заменяет**.
**Метод:** сверка [issues/README.md](./README.md) и issue-документов с кодом `lib/`; пересчёт матрицы по «Сводка»-таблицам каждого файла; прогон `vue-tsc`, `vitest run --coverage`, `prettier --check`, `eslint` (без `--fix`).

> Документ — снимок состояния на дату `updated`. Он **не** заменяет [issues/README.md](./README.md): source-of-truth прогресса остаётся в чекбоксах Fix roadmap. Здесь зафиксирован разрыв между тем, что заявляет roadmap, и тем, что реально лежит в `lib/`.

---

## 0. Что изменилось с прошлого снимка

| Было (2026-08-02)                                                       | Стало (2026-09-05)                                                                                                                                                                                                  |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Незакоммиченный батч (Table a11y, `sanitizeHtml`, unstyled-фикс)        | **Закоммичен**: `049dc28` (код, 8 файлов) + `9f6b683` (issue-доки, 6 файлов). B14 прошлого снимка закрыт                                                                                                            |
| `pnpm format:check` ❌ 3 файла, `eslint` ❌ 2 ошибки                    | ✅ оба чистые                                                                                                                                                                                                       |
| Дисклеймер: `pnpm lint` (= `eslint --fix`) записал в рабочее дерево     | В этот раз `eslint` запускался напрямую без `--fix` — рабочее дерево не тронуто                                                                                                                                     |
| `lib/` после аудита                                                     | **Не менялся**: `git diff --stat 049dc28 HEAD -- lib/` пуст, `git status -- lib/` пуст. Все code-факты прошлого снимка остаются валидными, якоря перепроверены точечно (§3)                                          |
| 14 позиций «закрыто в коде, устарело в документации»                    | **22** — 14 подтверждены + 8 новых (§3)                                                                                                                                                                             |
| Новых находок в коде нет                                                | **7** находок, отсутствующих во всех issue-файлах (§4). Самая заметная — Nuxt auto-import не регистрирует `MenuItem`/`MenuGroup`/`AccordionItem`, хотя [02-installation.md:26](../02-installation.md) обещает обратное |

---

## 1. Состояние ветки и quality gate

| Проверка                                    | Результат                                                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `pnpm typecheck` (vue-tsc)                  | ✅ exit 0                                                                                                    |
| `pnpm exec vitest run --coverage`           | ✅ 55 файлов, 5716 passed, 4 skipped, 19 todo (5739)                                                         |
| Coverage (агрегат)                          | 88.22% stmts / 78.68% branch / 89.56% funcs / 91.98% lines                                                   |
| `prettier --check "**/*.{js,ts,vue,d.ts}"`  | ✅ все файлы                                                                                                 |
| `eslint .` (без `--fix`)                    | ✅ 0 ошибок                                                                                                  |

**Pre-commit gate проходит.** Ветка чистая по `lib/`.

Незакоммиченное в рабочем дереве (не блокирует, но требует решения):

- **[package.json](../../package.json)** — `packageManager` поднят `pnpm@11.0.9 → 11.23.0+sha512…`. Каждая pnpm-команда печатает `[WARN] The "pnpm" field in package.json is no longer read by pnpm … "pnpm.onlyBuiltDependencies"`: блок [package.json:53](../../package.json#L53) — мёртвый конфиг, актуальная настройка уже живёт в [pnpm-workspace.yaml:1](../../pnpm-workspace.yaml#L1) (`allowBuilds`). Либо закоммитить bump и удалить блок, либо откатить.
- **`AGENTS.md`** (untracked) — копия [CLAUDE.md](../../CLAUDE.md) для Codex; отличается двумя строками (`./.Codex/commands/tz.md`, `~/.Codex/AGENTS.md`). Нужно решение: трекать как второй agent-guide (тогда синхронизировать с CLAUDE.md при каждой правке) или удалить.
- **`Documentation/issues/coverage/`** (gitignored) — артефакт от 2026-08-02 20:51: `vitest` был запущен с cwd `Documentation/issues`, а [vite.config.ts:22](../../vite.config.ts#L22) пишет `reportsDirectory: "./coverage"` относительно cwd. Мусор, безопасно удалить.

---

## 2. Реальное число оставшегося

### 2.1. Что заявляет документация — пять несогласованных чисел

| Источник в [issues/README.md](./README.md)                                                     | Число                                                    |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Строка TOTAL матрицы ([README.md:34](./README.md#L34))                                         | 0 Critical / 23 High / 30 Medium / 16 Low = **69**       |
| Текст «из них открыто» ([README.md:68](./README.md#L68))                                       | **77**                                                   |
| Сумма по 14 строкам активной таблицы                                                           | 0 / 22 / 23 / 19 = **64**                                |
| Сумма по «Сводка»-таблицам 26 активных файлов (пересчитано в этом аудите)                      | 0 / 22 / 23 / 20 = **65**                                |
| «115 numbered issues» ([README.md:68](./README.md#L68))                                        | фактически **253** заголовка `## Issue N` в 26 активных файлах (включая зачёркнутые) |
| Ячейка «25 active + 6 done»                                                                    | фактически 26 активных audit-документов + 3 файла в `done/` |

Единственное расхождение между строками README и «Сводка»-таблицами файлов — `_utilities.md` (Low: README 1, файл 2). Остальные 13 строк совпадают. **Дрейф сидит только в строке TOTAL и текстовых счётчиках**, а не в per-component цифрах.

Отдельно: методология README считает cross-cutting категории открытыми «до закрытия глобальной волны», даже если локально они решены. Пример — [button.md:23](./button.md#L23): матрица `0/0/1/3`, но «Button-локальных открытых секций нет; G34/D26/E29.7/G37 — cross-cutting категории, локально решены». **Матрица измеряет не задачи, а незакрытые волны.**

### 2.2. Что осталось на самом деле

Пересчёт по заголовкам issue-файлов:

| Слой                                                                                                                                  | Число  |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Незачёркнутых заголовков `## Issue N`                                                                                                 | 63     |
| − помечены resolved в теле/заголовке без `~~` (InputLayout ×10, Form 5, Split 8, Separator 1/4, Uno engine 1/3/5/6/7)                 | −19    |
| **= реально открытых numbered issues**                                                                                                | **44** |
| − закрыты глобально, ждут только doc-sync (§3, позиции 15–22)                                                                         | −10    |
| **= открытых с реальной работой**                                                                                                     | **34** |
| − дедуп cross-cutting «print / motion / RTL / colors» (Aria 11, Calendar 10, TextEditor 11, Theme 9 → это B5/B6)                      | −4     |
| **≈ дискретных задач**                                                                                                                | **≈30** |

Прошлый снимок давал «34–40». Разрыв с 69–77 в README — документационный дрейф плюс методология подсчёта, а не невыполненная работа.

### 2.3. Компоненты

|                                                                              | Число                                                                                      |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Компонентов в `lib/` (публичный barrel [lib/index.ts](../../lib/index.ts))   | **23** — 22 + `VirtualScroller`                                                            |
| Targets в матрице README                                                     | 29 (14 «активных» + 15 «завершённых»); `VirtualScroller` — 0 упоминаний в [issues/README.md](./README.md) |
| Targets с реально открытым кодом                                             | **12**: Calendar, TextEditor, Theme, Uno engine, Locale, Nuxt module, Label, Aria, Select, Loading, Alert, Utilities |
| Targets, у которых открыт только cross-cutting (print / RTL / coverage)      | остальные                                                                                  |

`VirtualScroller` есть в [Documentation/README.md:61](../README.md#L61), в [components/virtualscroller.md](../components/virtualscroller.md), в [specs/virtualscroller.md](../specs/virtualscroller.md), в Nuxt-регистрации ([nuxt.ts:115](../../lib/module/nuxt.ts#L115)) и в конфиге ([FishtVue.d.ts:218](../../lib/config/FishtVue.d.ts#L218)) — но **не** в сводке issues. При этом [CLAUDE.md:5](../../CLAUDE.md#L5) и [01-getting-started.md:13](../01-getting-started.md#L13), [:35](../01-getting-started.md#L35) по-прежнему говорят «22 компонента».

---

## 3. Закрыто в коде, но устарело в документации

Верифицировано против `lib/` на HEAD `9f6b683`. **22 позиции.** Позиции 1–14 — из прошлого снимка, перепроверены (якоря обновлены там, где lint-автофикс сдвинул строки); 15–22 — новые.

| #   | Roadmap / issue-файл говорит                                                                                                                        | Код говорит                                                                                                                                                                                | Доказательство                                                                                                                                                                                                                                                                                                                              |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Wave 6.3 Select compound — 3 чекбокса `[ ]` ([README.md:340-342](./README.md#L340-L342))                                                            | **Сделано**                                                                                                                                                                                | [SelectOption.vue](../../lib/select/SelectOption.vue), [SelectGroup.vue](../../lib/select/SelectGroup.vue); VNode-walk [Select.vue:92-97](../../lib/select/Select.vue#L92-L97); экспорт [select/index.ts:6-8](../../lib/select/index.ts#L6-L8); [issues/select.md:186](./select.md#L186) уже помечен ✅ 2026-06-13                          |
| 2   | 🔴 Critical cross-cutting: Table `v-html` ×5 ([README.md:529](./README.md#L529))                                                                    | **Ни одного `v-html` в Table**                                                                                                                                                             | [Table.vue:1639-1641](../../lib/table/Table.vue#L1639-L1641) — `markerParts` рендерит через `<mark>` + text-node. Единственный `v-html` во всём `lib/` — [Alert.vue:299](../../lib/alert/Alert.vue#L299), санитизированный                                                                                                                  |
| 3   | 🔴 Critical: Table IntersectionObserver + window mousemove/up — partial cleanup ([README.md:540](./README.md#L540))                                  | **Полный cleanup**                                                                                                                                                                         | [Table.vue:1246-1258](../../lib/table/Table.vue#L1246-L1258) — `disconnect()` обоих observers + `removeEventListener` ×3                                                                                                                                                                                                                    |
| 4   | 🔴 Critical: Dialog escapeListener при unmount-while-open ([README.md:541](./README.md#L541))                                                       | **Сделано**                                                                                                                                                                                | [Dialog.vue:221-226](../../lib/dialog/Dialog.vue#L221-L226) — `onBeforeUnmount` + `removeEventListener`                                                                                                                                                                                                                                     |
| 5   | Wave 10.4 `Aria.d.ts:97` — `change:modelValue` type bug ([README.md:443](./README.md#L443))                                                         | **Уже `payload: string`**                                                                                                                                                                  | [Aria.d.ts:125](../../lib/aria/Aria.d.ts#L125), JSDoc «Fixed in 2026-05-11»                                                                                                                                                                                                                                                                 |
| 6   | Wave 10.4 `TextEditor.d.ts` — тот же type bug ([README.md:444](./README.md#L444))                                                                   | **Уже `payload: string`**                                                                                                                                                                  | [TextEditor.d.ts:121](../../lib/texteditor/TextEditor.d.ts#L121); [issues/texteditor.md:165](./texteditor.md#L165) уже ✅ 2026-05-11                                                                                                                                                                                                        |
| 7   | Wave 10.4 `Form.vue` — корень `<form>` ([README.md:450](./README.md#L450))                                                                          | **Есть**                                                                                                                                                                                   | [Form.vue:478](../../lib/form/Form.vue#L478)                                                                                                                                                                                                                                                                                                |
| 8   | Wave 10.6 `calendar.md` Issue 9 — Floating UI ([README.md:467](./README.md#L467))                                                                   | **Resolved 2026-07-02**, чекбокс не проставлен                                                                                                                                             | [calendar.md:252](./calendar.md#L252) — заголовок зачёркнут ✅                                                                                                                                                                                                                                                                              |
| 9   | Wave 11 Table branch coverage 67% → 80% ([README.md:484](./README.md#L484))                                                                         | **80.34%** — цель достигнута                                                                                                                                                               | coverage-прогон                                                                                                                                                                                                                                                                                                                             |
| 10  | Wave 11 FixWindow 77% → ≥90% ([README.md:483](./README.md#L483))                                                                                    | **90.6%** — цель достигнута                                                                                                                                                                | coverage-прогон                                                                                                                                                                                                                                                                                                                             |
| 11  | Wave 11 TextEditor — «разблокировать 17 skipped tests (`vi.mock`)» ([README.md:479](./README.md#L479)); [texteditor.md:22](./texteditor.md#L22) — тот же заголовок | **0 `it.skip`**, 15 живых тестов, `vi.mock` отсутствует                                                                                                                       | но [TextEditor.vue](../../lib/texteditor/TextEditor.vue) = **0% coverage** (script 12–264) — формулировка устарела, содержательная цель не достигнута (§5, C2)                                                                                                                                                                              |
| 12  | Wave 11 acceptance: ≥85% statements / ≥75% branch project-wide                                                                                      | **88.22 / 78.68 — выше порога**                                                                                                                                                            | агрегат coverage                                                                                                                                                                                                                                                                                                                            |
| 13  | Wave 10.1 `prefers-reduced-motion` — счётчик «11 / 22» ([README.md:423](./README.md#L423))                                                          | Все **15** компонентов с `transition` несут `motion-safe`; 7 без transition (Badge, Calendar, Icons, Loading, Pagination, Separator, TextEditor)                                           | перенесено из снимка 2026-08-02 (`lib/` не менялся); построчный аудит unprefixed-остатков **не проводился** (см. Known issues)                                                                                                                                                                                                              |
| 14  | Матрица сводки                                                                                                                                      | `VirtualScroller` — 23-й компонент, отсутствует в сводке целиком                                                                                                                           | §2.3                                                                                                                                                                                                                                                                                                                                        |
| 15  | Wave 10.5 `component/index.ts:68` — `inject(FishtVueSymbol)` primary, `window.FishtVue` fallback ([README.md:456](./README.md#L456))               | **`window.FishtVue` уже только fallback**; primary — `appContext.config.globalProperties.$fishtVue`                                                                                          | [component/index.ts:67-68](../../lib/component/index.ts#L67-L68); [component-class.md:63](./component-class.md#L63) — Issue 2 ✅ resolved 2026-05-20. Roadmap-чекбокс отстал; буквальный `inject(FishtVueSymbol)` — вкусовщина, не gap                                                                                                     |
| 16  | Wave 12 «02-installation.md — обновить с peer-deps optional flags» ([README.md:511](./README.md#L511))                                              | **Уже обновлён** (Wave 2.1)                                                                                                                                                                | [02-installation.md:57-65](../02-installation.md#L57-L65) — секция про required `vue` + optional `v-calendar`/`quill`/`gsap`, ссылка на `package.test.ts`                                                                                                                                                                                  |
| 17  | Wave 12 codemod «`change:modelValue` type для Aria/TextEditor» ([README.md:508](./README.md#L508))                                                  | **Нечего кодмодить** — исправление type-only, runtime всегда эмитил string                                                                                                                 | позиции 5–6                                                                                                                                                                                                                                                                                                                                 |
| 18  | 9 per-component issues «SSR styles + sideEffects + unstyled» — все ссылаются на button.md Issues 1/8/9/14: [aria.md:77](./aria.md#L77), [calendar.md:156](./calendar.md#L156), [label.md:58](./label.md#L58), [theme.md:172](./theme.md#L172), [locale.md:108](./locale.md#L108), [nuxt-module.md:138](./nuxt-module.md#L138), [texteditor.md:159](./texteditor.md#L159), [alert.md:132](./alert.md#L132) (partial), [separator.md:25](./separator.md#L25) | **Все четыре корневых issue закрыты**: [button.md:34](./button.md#L34) Issue 1 ✅ 2026-06-07, [:281](./button.md#L281) Issue 8 ✅ 2026-06-07, [:306](./button.md#L306) Issue 9 ✅ 2026-06-11, [:484](./button.md#L484) Issue 14 ✅ 2026-05-11 | Wave 2 ✅ closed 2026-06-21, Wave 3.1 ✅. Это **до 8 High-счётчиков** в матрице (Calendar, Label, Aria, Theme, Locale, Nuxt, TextEditor — по одному A2/A4-5/C17), которые снимаются doc-sync'ом |
| 19  | [calendar.md:219](./calendar.md#L219) Issue 7 «`unstyled: true` не обрабатывается» — заголовок не зачёркнут                                         | Тело issue само пишет «✅ framework-level resolved»                                                                                                                                         | [calendar.md:221](./calendar.md#L221)                                                                                                                                                                                                                                                                                                       |
| 20  | [\_utilities.md:53](./_utilities.md#L53) Issue 4 «dateHandler coverage — требует подтверждения (прежний отчёт 72.61 / 65.38 был на старой версии)» | **Подтверждено на текущей версии: 72.61 / 65.38**, непокрыто [dateHandler.ts:342-362](../../lib/utils/dateHandler.ts#L342-L362)                                                             | coverage-прогон. Issue переквалифицируется из «неизвестно» в конкретный coverage-gap (B10)                                                                                                                                                                                                                                                  |
| 21  | [\_utilities.md:113](./_utilities.md#L113) Issue 11 «Utils.ts coverage 0% — не реальная проблема»                                                   | Тело: «Issue снимается без действий» — но заголовок не зачёркнут, попадает в счётчики                                                                                                      | doc-sync                                                                                                                                                                                                                                                                                                                                    |
| 22  | Wave 7 ([README.md:365](./README.md#L365)) «Select — то же для dropdown list» без упоминания примитива                                               | `VirtualScroller` + `useVirtualScroll` в `lib/` с 2026-06-13, [select.md:312-316](./select.md#L312-L316) помечен «🔓 unblocked (integration pending)»                                        | roadmap не знает, что блокер снят                                                                                                                                                                                                                                                                                                           |

### Противоречие внутри одного файла (сохраняется)

[components/select.md:194](../components/select.md#L194) содержит §9.5 «Compound API (`<SelectOption>` / `<SelectGroup>`)», а [components/select.md:339](../components/select.md#L339) в Known issues пишет:

> Compound `<Select><SelectOption>` API отсутствует — только schema-driven. Roadmap: Wave 6.3

---

## 4. Новые находки в коде (нет ни в одном issue-файле)

Найдены при точечном чтении файлов в этом аудите. Severity — экспертная, для обсуждения при W1.

| ID  | Что                                                                                                                                                                                                                                                                                                                           | Где                                                                                                                                                                                              | Severity | Оценка   |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | -------- |
| N1  | **Nuxt auto-import не регистрирует `MenuItem` / `MenuGroup` / `AccordionItem`.** `FISHT_VUE_SUBCOMPONENTS` содержит только Column/ColumnGroup/FormField/FormSection/SelectOption/SelectGroup. При этом barrel'ы их экспортируют, а [02-installation.md:26](../02-installation.md#L26) обещает «В Nuxt — глобальны». В Nuxt-приложении `<MenuItem>` без ручного импорта → unresolved component | [nuxt.ts:119-126](../../lib/module/nuxt.ts#L119-L126); экспорты [menu/index.ts:7-8](../../lib/menu/index.ts#L7-L8), [accordion/index.ts:7](../../lib/accordion/index.ts#L7) | **medium** | 0.25–0.5 д |
| N2  | **`disableGlobalStyles` — no-op.** Объявлен в `defaults`, вычитается из plugin-опций через `MODULE_OPTIONS` и **нигде не читается** в `setup()`. Это точный диагноз для [nuxt-module.md:123](./nuxt-module.md#L123) Issue 5 («что именно отключается?» — ничего)                                                              | [nuxt.ts:34](../../lib/module/nuxt.ts#L34), [:91](../../lib/module/nuxt.ts#L91)                                                                                                                  | medium   | входит в B16 |
| N3  | **Мёртвая ветка `isNuxt4()`.** `const importPath = isV4 ? "#app" : "#app"` — обе ветки одинаковы. Значит `getNuxtVersion()` с `createRequire` + `require("nuxt/package.json")` ([nuxt-module.md:45](./nuxt-module.md#L45) Issue 2, «fragile в pure ESM») существует **только ради мёртвого кода** — удаляется целиком, Issue 2 закрывается бесплатно | [nuxt.ts:9-21](../../lib/module/nuxt.ts#L9-L21), [:74-75](../../lib/module/nuxt.ts#L74-L75)                                                                                                       | low      | входит в B16 |
| N4  | **Хардкод русских строк в CSS TextEditor:** `content: "Ваша ссылка"` и `content: "Сохранить"` для Quill link-tooltip — вне locale-механизма, не покрыто [texteditor.md:234](./texteditor.md#L234) Issue 9 (там только alignment/dialog buttons). Плюс `<style>` не scoped: селекторы `.ql-snow .ql-toolbar …` без префикса `.editor` протекают на любой Quill на странице | [TextEditor.vue:489](../../lib/texteditor/TextEditor.vue#L489), [:493](../../lib/texteditor/TextEditor.vue#L493); утечка — [:286-298](../../lib/texteditor/TextEditor.vue#L286-L298)            | medium   | входит в B12 / C2 |
| N5  | **TextEditor dark-тема игнорирует `darkModeSelector`** — переключается по `@media (prefers-color-scheme)`. [texteditor.md:122](./texteditor.md#L122) упоминает это как «известное поведение», но issue не заведён. Table в `049dc28` получил `darkModeSelector`-aware `isDark` — библиотека теперь непоследовательна            | [TextEditor.vue:380-400](../../lib/texteditor/TextEditor.vue#L380-L400)                                                                                                                          | low      | 0.5 д    |
| N6  | **Coverage считает test-helpers.** `coverage.exclude` не исключает `lib/theme/unoStyle/test-helpers*.ts` → `test-helpers-advanced.ts` (0%) и `test-helpers.ts` (86.66%) занижают агрегат. Плюс `coverage.enabled: true` + относительный `reportsDirectory` → мусорные `coverage/` при запуске из другого cwd (§1)            | [vite.config.ts:19-26](../../vite.config.ts#L19-L26)                                                                                                                                             | low      | входит в B17 |
| N7  | **Счётчик «22 компонента» в agent-guide и getting-started** при 23 в barrel                                                                                                                                                                                                                                                   | [CLAUDE.md:5](../../CLAUDE.md#L5), `AGENTS.md:5`, [01-getting-started.md:13](../01-getting-started.md#L13), [:35](../01-getting-started.md#L35)                                                   | low      | входит в B13 |

---

## 5. Маленькие независимые батчи

Каждый — отдельный PR. Между собой не конфликтуют, могут идти параллельно.

| ID  | Батч                                                                                                                                                                                                                                                                                                      | Файлы / точки                                                                                                          | Оценка     |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------- |
| B1  | ~~`window.FishtVue` → `inject(FishtVueSymbol)` primary path~~ → **doc-sync** (§3, поз. 15). Если нужен буквально `inject` — микро-рефактор                                                                                                                                                                 | [component/index.ts:67-68](../../lib/component/index.ts#L67-L68)                                                       | 0–0.25 д   |
| B2  | `Label.vue` translate-y px → CSS custom properties ([label.md:80](./label.md#L80) Issue 5)                                                                                                                                                                                                                | [Label.vue:42-47](../../lib/label/Label.vue#L42-L47) — 6 hardcode-сайтов                                               | 0.5–1 д    |
| B3  | TextEditor: скрытый `<input>` для native form submit ([texteditor.md:250](./texteditor.md#L250) Issue 10)                                                                                                                                                                                                  | [TextEditor.vue:204-270](../../lib/texteditor/TextEditor.vue#L204-L270) — `<input>` в template отсутствует             | 0.5 д      |
| B4  | `arrayHandler.sort` стабильность — задокументировать ([\_utilities.md:93](./_utilities.md#L93) Issue 9)                                                                                                                                                                                                   | `Documentation/utilities/`                                                                                             | 0.25 д     |
| B5  | Print styles: 12 компонентов без `print:` + единый `@media print` блок (список — снимок 2026-08-02, `lib/` не менялся)                                                                                                                                                                                    | Accordion, Alert, Badge, Calendar, Dialog, FixWindow, Icons, Label, Menu, Separator, Split, TextEditor                  | 1.5–2.5 д  |
| B6  | RTL: физические `left/right/ml/mr/pl/pr` → логические. TextEditor подтверждён при чтении: `right-0`, `text-left`, `padding-right`, `margin-right`, `left: 6px` ([TextEditor.vue:74-75](../../lib/texteditor/TextEditor.vue#L74-L75), [:409](../../lib/texteditor/TextEditor.vue#L409), [:503](../../lib/texteditor/TextEditor.vue#L503)); Label — `after:ml-0.5` ([Label.vue:49](../../lib/label/Label.vue#L49)) | Calendar, Dialog, InputLayout, Table (остатки), TextEditor, Pagination, Label                                           | 1.5–2.5 д  |
| B7  | `useDirectionality()` composable + RTL-флаг в `NameLocale` ([locale.md:84](./locale.md#L84) Issue 4)                                                                                                                                                                                                       | новый файл + `lib/locale/`                                                                                             | 1–2 д      |
| B8  | RTL-тесты с `dir="rtl"` по компонентам (snapshot-based)                                                                                                                                                                                                                                                   | все компоненты                                                                                                         | 2–3 д      |
| B9  | Coverage 0% → тесты: `config/baseStyle.ts`, `locale/{index,en,ru}.ts`, `theme/themes/*`, `theme/semantic.ts`                                                                                                                                                                                              | 5+ файлов                                                                                                              | 2–3 д      |
| B10 | Coverage добор: Calendar 77.07/72.91 → 80/70, VirtualScroller 73.35/56.28, dateHandler 72.61/65.38 (строки 342-362). **Select 81.05/70.94 — уже в норме**, из батча исключён (прошлый снимок числил его ниже порога ошибочно)                                                                              | 3 файла                                                                                                                | 2–3 д      |
| B11 | Nuxt module + plugins тесты через `@nuxt/test-utils` (сейчас 0%)                                                                                                                                                                                                                                          | [module/nuxt.ts](../../lib/module/nuxt.ts), [plugins/](../../lib/plugins/)                                             | 2–4 д      |
| B12 | i18n UI-текстов: Alert Confirm/Cancel, Dialog title, авто-wiring rule-messages для standalone Input/Select, **+ N4** (TextEditor `content:`-строки → locale)                                                                                                                                              | 5 точек                                                                                                                | 1–2 д      |
| B13 | **Doc-sync**: 22 позиции §3, строка VirtualScroller в матрице, пересчёт TOTAL и «открыто N», снятие противоречия в `select.md`, «22 → 23 компонента» (N7), ~12 roadmap-чекбоксов (6.3 ×3, 10.4 ×3, 10.5, 10.6, 11 ×3, 12 installation), удаление мёртвого блока `pnpm` в package.json (или как B17)          | только `Documentation/` + `CLAUDE.md`/`AGENTS.md`                                                                      | 1.5–2.5 д  |
| B15 | **N1**: добавить `MenuItem`/`MenuGroup`/`AccordionItem` в `FISHT_VUE_SUBCOMPONENTS` + тест регистрации                                                                                                                                                                                                   | [nuxt.ts:119-126](../../lib/module/nuxt.ts#L119-L126)                                                                  | 0.25–0.5 д |
| B16 | **N2 + N3**: удалить `getNuxtVersion`/`isNuxt4`/`createRequire` (закрывает nuxt-module Issue 2), либо реализовать `disableGlobalStyles`, либо удалить опцию с deprecation (Issue 5)                                                                                                                       | [nuxt.ts](../../lib/module/nuxt.ts)                                                                                    | 0.5–1 д    |
| B17 | **Tooling hygiene**: `coverage.exclude` для `test-helpers*.ts` (N6), закоммитить/откатить `packageManager` bump + убрать `pnpm.onlyBuiltDependencies`, решение по `AGENTS.md`, удалить `Documentation/issues/coverage/`                                                                                     | [vite.config.ts:25](../../vite.config.ts#L25), [package.json:53](../../package.json#L53)                               | 0.25–0.5 д |
| B18 | Date/number formatting по locale ([locale.md:112](./locale.md#L112) Issue 6 → calendar.md Issue 8) — единственный numbered issue с реальной работой, у которого **нет ни одного пункта в roadmap**                                                                                                          | `lib/locale/`, `lib/utils/dateHandler.ts`, `numberHandler.ts`                                                          | 1–2 д      |

**Итого: 18–30 инженеро-дней.** B1, B13, B17 кода почти не касаются.

---

## 6. Эпики, breaking-изменения и продуктовые решения

### 6.1. Эпики

| ID  | Эпик                                                                                                                                                                                                                                                                                                                                                                                              | Оценка               | Риск                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | --------------------------------------------------------------- |
| C1  | **Select virtualization.** Примитив [VirtualScroller](../../lib/virtualscroller/VirtualScroller.vue) + [useVirtualScroll](../../lib/virtualscroller/useVirtualScroll.ts) написан, покрыт тестами и экспортирован — [Select.vue](../../lib/select/Select.vue) на него не ссылается. План интеграции уже расписан в [select.md:316](./select.md#L316). Опционально + Menu                          | 3–5 д (+1–2 на Menu) | средний                                                         |
| C2  | **TextEditor.** 0% coverage при 15 «зелёных» тестах + Quill toolbar i18n (Issues 8, 9, N4) + `image-upload-request` handler вместо base64-инжекции ([TextEditor.vue:98](../../lib/texteditor/TextEditor.vue#L98), Issue 6) + N5 dark-mode                                                                                                                                                     | 4–7 д                | **высокий** — Quill как lazy optional peer-dep, сложный mocking |
| C5  | **Loading epic-spinners theming** ([loading.md:157](./loading.md#L157) Issue 7) — блокирует подъём статуса beta → stable                                                                                                                                                                                                                                                                         | 2–3 д                | низкий                                                          |
| C7  | **Nuxt module** — остаток после B15/B16: hardcoded `FISHT_VUE_COMPONENTS` ([nuxt-module.md:81](./nuxt-module.md#L81) Issue 3, генерация из barrel), `prefer-component-naming` ([:156](./nuxt-module.md#L156) Issue 8, docs)                                                                                                                                                                    | 1.5–3 д              | средний                                                         |
| C9  | **Uno engine — остаток Tailwind v4 parity** ([uno-engine.md:61](./uno-engine.md#L61) Issue 2: функциональные варианты, container queries; [:177](./uno-engine.md#L177) Issue 4: P2/P3-семейства). Не упомянут ни в roadmap README, ни в прошлом снимке. Fail-closed уже стоит — это чистый coverage gap диалекта                                                                                 | 2–4 д                | низкий (fail-closed + тесты `v4Extensions.test.ts`)             |

### 6.2. Требуют продуктового решения — работу начинать нельзя

| ID  | Решение                                                                                                                                   | Почему нельзя решить в коде                                                                                                                                                                                                                                                                   | Оценка после решения |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| C3  | **`primitive.ts` (776 строк) → per-color файлы для tree-shake** ([theme.md:176](./theme.md#L176) Issue 7)                                 | Меняет раскладку модулей — это публичная поверхность импорта. Нужен ответ: остаётся ли `fishtvue/theme/primitive` единой точкой входа                                                                                                                                                         | 2–4 д                |
| C4  | **Alert semantic-intent эпик** — `green`/`yellow`/`blue`/`red` → semantic-слоты success/warning/info/error + runtime update-функции ([alert.md:196](./alert.md#L196) Issue 9) | Новые имена токенов = **навсегда** публичный API. По контракту диалекта ([theme.md](./theme.md) §3.1): новый цвет = добавить в `primitive.ts.colors` + `namesColors`, `unoRules.ts` не патчить                                                                                       | 4–6 д                |
| C6  | **Wave 9: «`theme/uno.ts` — определить semantic mappings»** ([README.md:407](./README.md#L407))                                           | [theme/uno.ts](../../lib/theme/uno.ts) — **3 строки** re-export'а `tailwind`. Пункт мископирован — движок в `unoStyle/`. Решение: закрыть как invalid или переопределить scope                                                                                                               | 0 д, если invalid    |
| C8  | **Calendar dual-API** ([calendar.md:163](./calendar.md#L163) Issue 5, «deferred — redesign»). Calendar **не входит** в Wave 6 (Table → Form → Select → Menu → Accordion), но сидит в матрице как medium P. Решение: включить в критерий закрытия или вынести «за пределы сводки» | Redesign `datePickerOptions` — product scope, не quick fix                                                                                                                                                                                                                                | 3–5 д, если в scope  |
| D1  | **Codemod-пакет `fishtvue-codemod`** (4 трансформа после позиции 17 §3)                                                                   | Отдельный публикуемый npm-пакет? Требует jscodeshift / ts-morph — [CLAUDE.md](../../CLAUDE.md) запрещает новые dependencies в `lib/` без явного approve                                                                                                                                       | 4–7 д                |

### 6.3. Breaking changes (нужен major bump)

| ID  | Что                                                                                                                                                                                        | Статус                                                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| D3  | **`Aria` → `Textarea`** — rename компонента + import-update                                                                                                                                | [aria.md:99](./aria.md#L99) Issue 6 «open (deferred to breaking-change PR)». Без этого `aria.md` не закрывается — **сводку нельзя закрыть без major-релиза** |
| D4  | Hard removal deprecated-алиасов: `stileIcon` → `variant`, `iconPosition "left"/"right"` → `"start"/"end"`, `delete` emit → `close` (Badge), `contentPosition "left"/"right"` (Separator)   | soft deprecation в коде с 2026-05-10 / 2026-06-07 / 2026-06-14 ([badge.md:92](./badge.md#L92), [icons.md:121](./icons.md#L121), [button.md:104](./button.md#L104), [separator.md:53](./separator.md#L53)); снятие = breaking |
| D2  | `Documentation/issues/migration-guide.md` — **не существует**. ~~02-installation.md~~ уже обновлён (§3, поз. 16). `CHANGELOG.md` — auto-generated, руками не трогать                        | сжался до одного файла                                                                                                                             |

**Wave 12 не начата:** ни codemod-директории, ни `migration-guide.md` в репозитории нет.

---

## 7. Волны до состояния «сводка закрыта»

**Определение готовности:** матрица `0/0/0/0` по всем targets, все файлы перемещены в [./done/](./done/), `VirtualScroller` добавлен в сводку.

```
        ┌──────────────────────────────────────────────── КРИТИЧЕСКИЙ ПУТЬ ─┐
W0 ──► W1 (решения) ────────────────► W4 (эпики) ──► W5 (breaking+codemods) ──► ✅
 │                                        ▲
 ├──► W2 (мелкие батчи, параллельно) ──────┤
 └──► W3 (coverage / RTL / print, паралл.) ┘
```

| Волна                        | Содержание                                                                                                                                                | Оценка                           | Календарь (1 dev) | Параллельно?                                                                                                                 |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **W0. Санация базы**         | B13 (doc-sync 22 позиций, VirtualScroller, пересчёт TOTAL) + B17 (tooling hygiene)                                                                        | **1.75–3 д**                     | ~0.5 нед          | ❌ **критический путь** — до этого счётчики недостоверны, планировать по ним нельзя                                          |
| **W1. Решения**              | C3 (раскладка primitive), C4 (semantic-слоты Alert), C6 (судьба uno.ts), C8 (Calendar dual-API в scope?), C9 (v4 parity в scope?), D1 (codemod как пакет), D3 (когда major) | **0 д работы, 1 сессия решений** | 1 встреча         | ❌ критический путь — блокирует W4 и W5                                                                                      |
| **W2. Мелкие батчи**         | B2, B3, B4, B12, B15, B16, B18                                                                                                                            | **4–7.5 д**                      | ~1.5 нед          | ✅ полностью параллельно, конфликтов между собой нет (B15/B16 — один файл, делать одним PR)                                  |
| **W3. Cross-cutting sweeps** | B5 (print), B6 → B7 → B8 (RTL), B9 + B10 + B11 (coverage)                                                                                                 | **12–19.5 д**                    | 2.5–4 нед         | ✅ параллельно с W2 и W4. Внутри: цепочка B6 → B7 → B8 последовательна (тесты после composable), print и coverage независимы |
| **W4. Эпики**                | C1 (Select virtual), C2 (TextEditor), C5 (Loading), C7 (Nuxt), C9 (Uno v4 parity) + C3/C4/C8 после решения                                                | **18–34 д**                      | 3.5–7 нед         | ✅ взаимно независимы. **C2 — самый длинный и рискованный, начинать первым**                                                 |
| **W5. Migration & DX**       | D1 codemods, D2 migration-guide, D3/D4 breaking + major-релиз                                                                                              | **6.5–12 д**                     | 1.5–2.5 нед       | ❌ критический путь — по определению после W4 (кодмоды покрывают финальный набор deprecated API)                             |

### 7.1. Итоги по объёму

| Сценарий                                      | Инженеро-дни  | Календарь       |
| --------------------------------------------- | ------------- | --------------- |
| Сумма всей работы                             | **42–77 д**   | —               |
| 1 разработчик, последовательно                | 42–77 д       | **9–16 недель** |
| 2–3 разработчика, максимальная параллелизация | те же 42–77 д | **5–8 недель**  |

Относительно снимка 2026-08-02 (40–75 д): −B14 (закоммичен), −B1 (doc-sync), −половина D2; +C9, +B15, +B16, +B17, +B18. Итог сдвинулся на +2 дня — новые находки перекрыли закрытое.

### 7.2. Критический путь

Минимальная длительность независимо от числа людей:

```
W0 (2–3 д) → W1 (решения) → C2 TextEditor (4–7 д) → W5 (6.5–12 д)
≈ 12.5–22 инженеро-дня ≈ 3–5 недель
```

Всё остальное — W2 и W3, суммарно ~16–27 дней — **укладывается внутрь этого окна при 2+ людях**. Третий разработчик даёт мало: узкое место — TextEditor и финальный migration/breaking-заход.

### 7.3. Что можно делать параллельно

Три независимых трека, не пересекающихся по файлам:

- **Трек A (критический):** W0 → W1 → C2 TextEditor → W5
- **Трек B:** B15+B16 (Nuxt), B2, B3, B4, B12, B18, затем C1 Select virtual, C5 Loading, C7 Nuxt, C9 Uno
- **Трек C:** B5 print, B6 → B7 → B8 RTL, B9 → B10 → B11 coverage

Единственная синхронизация между треками — W0 (общая база счётчиков) и W1 (решения).

---

## 8. Рекомендации по порядку

1. **Сегодня.** B17: решить судьбу `packageManager`-bump и `AGENTS.md`, убрать мёртвый `pnpm`-блок, удалить `Documentation/issues/coverage/`. 0.25 дня — снимает шум `[WARN]` в каждой команде и подвешенное состояние рабочего дерева.
2. **Затем B15** (0.25–0.5 д) — единственная находка, которая ломает обещание документации потребителю в Nuxt прямо сейчас.
3. **Затем W0 (B13).** Без doc-sync любая оценка по матрице врёт на 30–40 позиций. Список из §3 — готовый чеклист.
4. **Параллельно с W0** — созвать W1: семь решений (C3, C4, C6, C8, C9, D1, D3). Кода не требуют, разблокируют самую длинную ветку.
5. **C2 (TextEditor) стартовать сразу после W1** — единственный элемент, реально задающий длину проекта.

### Отдельно требует явного решения

**Закрытие сводки требует major-релиза** — из-за D3 (`Aria` → `Textarea`). Если major в ближайшие месяцы не планируется, [aria.md](./aria.md) не закроется и состояние «сводка закрыта» недостижимо по текущему определению.

Альтернатива — переопределить критерий готовности: `0/0/0/0` по всем targets **кроме явно отложенных до major**, с отдельным разделом «Отложено до v-next» в [issues/README.md](./README.md). Туда же логично отнести C8 (Calendar dual-API), если решение — «не в scope».

---

## Приложение: coverage по модулям

Прогон на HEAD `9f6b683`, рабочее дерево `lib/` чистое. Агрегат: **88.22% stmts / 78.68% branch / 89.56% funcs / 91.98% lines**.

### Ниже целевого порога (≥80% stmts / ≥70% branch)

| Модуль                                              | Stmts    | Branch   | Примечание                                         |
| --------------------------------------------------- | -------- | -------- | -------------------------------------------------- |
| `texteditor/TextEditor.vue`                         | **0**    | **0**    | script 12–264 (файл 509 строк, остальное `<style>`) |
| `config/baseStyle.ts`                               | **0**    | **0**    | B9                                                 |
| `locale/index.ts`, `locales/{en,ru}.ts`             | **0**    | **0**    | B9                                                 |
| `theme/themes/{Aurora,Harmony,Sapphire}.ts`         | **0**    | **0**    | B9                                                 |
| `theme/semantic.ts`, `theme/uno.ts`                 | **0**    | **0**    | B9 (uno.ts — 3 строки re-export)                   |
| `module/nuxt.ts`                                    | **0**    | **0**    | B11                                                |
| `plugins/{Plugins,nuxt}.ts`                         | **0**    | **0**    | B11                                                |
| `utils/Utils.ts`                                    | **0**    | **0**    | non-issue (барель), `_utilities.md` Issue 11       |
| `theme/unoStyle/test-helpers-advanced.ts`           | **0**    | **0**    | **тест-хелпер, должен быть в `coverage.exclude`** (N6) |
| `virtualscroller/VirtualScroller.vue`               | 73.35    | 56.28    | B10 (`useVirtualScroll.ts` — 95.23 / 81.15)        |
| `utils/dateHandler.ts`                              | 72.61    | 65.38    | B10, строки 342–362                                |
| `calendar/Calendar.vue`                             | 77.07    | 72.91    | B10                                                |
| `theme/$dt.ts`                                      | 79.16    | 72.41    | на грани                                           |
| `form/fieldRegistry.ts`                             | 75       | 100      | 1 непокрытая строка                                |
| `theme/updatePreset.ts` / `updatePrimaryPalette.ts` | 83 / 95  | 66 / 60  | branch ниже порога                                 |
| `utils/scrollLockHandler.ts`                        | 91.66    | 65       | branch ниже порога                                 |

### Ложные нули — renderless-дети

`AccordionItem.vue`, `FormField.vue`, `FormSection.vue`, `MenuGroup.vue`, `MenuItem.vue`, `SelectGroup.vue`, `SelectOption.vue`, `Column.vue`, `ColumnGroup.vue` и все `index.ts`-барели показывают 0%, но имеют собственные тест-файлы. Это VNode-walk descriptors — они никогда не рендерятся, поэтому v8 не видит покрытия. **Реальным пробелом не являются.**

### Достигли цели (были в roadmap как открытые)

| Модуль              | Stmts    | Branch    | Цель roadmap  |
| ------------------- | -------- | --------- | ------------- |
| `table/Table.vue`   | 92.99    | **80.34** | branch ≥80 ✅ |
| `fixwindow/*`       | **90.6** | 84.96     | ≥90 ✅        |
| `split/Split.vue`   | 85.1     | 72.3      | ≥80/70 ✅     |
| `select/Select.vue` | 81.05    | 70.94     | ≥80/70 ✅ (в снимке 2026-08-02 ошибочно числился ниже порога) |

---

## Known issues & limitations

- **Cross-file sweeps (print / RTL / motion-safe) не перепрогонялись.** В этой сессии `grep`/`ls` по `lib/` блокируются pre-tool хуком, а индекс trace-mcp покрывает только Nuxt-паттерны (`app/**`, `components/**`, …), не `lib/`. Списки B5/B6 и пункт 13 §3 перенесены из снимка 2026-08-02 на основании `git diff --stat 049dc28 HEAD -- lib/` = пусто. Точечные утверждения (§3 поз. 1–8, 15; §4 N1–N6) проверены чтением конкретных файлов.
- **Построчный аудит unprefixed `transition-*` внутри компонентов по-прежнему не проводился** — точечные остатки возможны.
- **Severity новых находок §4 — экспертная**, не по методологии 60-пунктового чек-листа. Категоризацию (A/C/F/K…) делать при заведении issue в B13.
- **Оценки в днях — экспертные, не выведены из истории велосити** репозитория. Диапазоны отражают неопределённость scope, а не статистику.
- **Пересчёт матрицы (§2) сделан по «Сводка»-таблицам и заголовкам `## Issue N`.** Файлы с нестандартной разметкой (InputLayout — все 10 заголовков без `~~` при матрице `0/0/0/0`) считались по матрице, а не по заголовкам.
- **Документ не является source-of-truth прогресса** — им остаются чекбоксы Fix roadmap в [issues/README.md](./README.md). При расхождении побеждает README.
