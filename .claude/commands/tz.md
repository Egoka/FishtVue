---
description: Process a new technical spec (ТЗ) end-to-end for the FishtVue Vue 3 / TS component library — mandatory docs review, canon + known-issues validation, tests-first development, synchronized doc updates.
argument-hint: <text of the technical spec, or leave empty and paste afterwards>
---

# /tz — ТЗ-driven workflow (FishtVue)

Ты обрабатываешь новый ТЗ для библиотеки `fishtvue` (Vue 3 + TypeScript + Vitest 4 + Rollup 4, pnpm-monorepo). Следуй пайплайну **без пропуска шагов**. Каждый шаг гейтит следующий.

## Спецификация

$ARGUMENTS

Если секция выше пустая — попроси пользователя вставить ТЗ перед переходом к шагу 1.

---

## Step 0 — Enter plan mode

Используй `EnterPlanMode` до любых действий. Шаги 1–5 — research/validation: никаких правок в `lib/**`, `Documentation/**`, никаких `git`-команд, никаких mutating `pnpm`-скриптов (`pnpm install`, `pnpm format`, `pnpm lint:fix`, `pnpm test:watch` и пр.) до явного approve финального плана.

Read-only `pnpm`-скрипты (`pnpm typecheck`, `pnpm test --run`, `pnpm format:check`) допустимы для проверки гипотез на этапе анализа, но не для исправлений.

---

## Step 1 — ANALYZE the ТЗ

Извлеки из спецификации:
- **Component(s) / module(s) touched** — какие пакеты в `lib/{name}/` затрагиваются? (button, input, select, table, theme, locale, component, и т.д.)
- **Public surface** — изменяется ли `{Name}Props` / `{Name}Emits` / `{Name}Slots` / `{Name}Expose` / `{Name}Option` в `lib/{name}/{Name}.d.ts`? Меняется ли публичный экспорт в `lib/{name}/package.json`?
- **Cross-cutting concerns** — задействованы ли:
  - `Component` class hooks (`__hooks()`, `initStyle()`, `getOptions()` — см. `lib/component/index.ts`),
  - тема и токены (`lib/theme/`, Tailwind),
  - локали (`lib/locale/`),
  - утилиты (`lib/utils/...Handler.ts`),
  - доступность (`aria-*`, `role`, keyboard nav),
  - `v-html` / XSS surface (см. cross-cutting findings в `Documentation/issues/README.md`).
- **Invariants at risk** — противоречит ли ТЗ канону из `Documentation/dev-patterns.md` §2 (Decisions) или известным issues в `Documentation/issues/{target}.md`?

Будь конкретен. «Button» — мало; «добавить в Button проп `loading: boolean` со spinner-слотом» — то, что нужно. От этой точности зависит роутинг в шаге 2.

---

## Step 2 — ROUTE → docs (mandatory list)

Сопоставь анализ с файлами документации по таблице ниже. Каждое совпадающее ключевое семейство добавляет свои документы в обязательный список. **Всегда** включай строку `always`.

Создай `TodoWrite` со списком, по одному пункту на файл, префикс `Read docs: `. Помечай `completed` только после фактического чтения файла в шаге 3.

> ⚠️ **Naming asymmetry.** В `Documentation/components/` имена с дефисами: `fix-window.md`, `input-layout.md`, `text-editor.md`. В `Documentation/issues/` — без дефисов: `fixwindow.md`, `inputlayout.md`, `texteditor.md`. Учитывай это при сборке списка.

### Routing table

| Keyword family | Required docs |
|---|---|
| button, label, switch, badge, separator | `Documentation/components/{name}.md` + `Documentation/issues/{name}.md` |
| input, select, calendar, text-editor (`texteditor` в issues), table, pagination | `Documentation/components/{name}.md` + `Documentation/issues/{name → fix asymmetry}.md` |
| form, validation, rules, schema | `Documentation/components/form.md`, `Documentation/components/input-layout.md` (issues: `inputlayout.md`), `Documentation/utilities/rulesHandler.md`, `Documentation/issues/form.md` |
| dialog, menu, accordion, alert, fix-window (`fixwindow` в issues), loading | matching `Documentation/components/{name}.md` + `Documentation/issues/{name}.md` |
| split, scroll, layout container | `Documentation/components/split.md`, `Documentation/issues/split.md` |
| theme, dark, light, tailwind, tokens, css | `Documentation/architecture/theme.md`, `Documentation/issues/theme.md`, `Documentation/utilities/tailwindHandler.md`, `Documentation/utilities/colorsHandler.md` |
| locale, i18n, translation, ru, en | `Documentation/architecture/locale.md`, `Documentation/issues/locale.md` |
| config, plugin, options, global, useFishtVue | `Documentation/architecture/config.md`, `Documentation/issues/config.md` |
| component class, lifecycle, initStyle, hooks, ClassComponent, `__hooks` | `Documentation/architecture/component-class.md`, `Documentation/issues/component-class.md` |
| nuxt, ssr, module, auto-import | `Documentation/architecture/nuxt-module.md`, `Documentation/issues/nuxt-module.md` |
| utility, handler, helper (array / colors / date / dom / function / number / object / rules / string / tailwind / uniqueCollection) | matching `Documentation/utilities/{name}Handler.md` (или `uniqueCollection.md`) + `Documentation/issues/_utilities.md` |
| aria, a11y, accessibility, keyboard, focus, screen reader | `Documentation/components/aria.md`, `Documentation/issues/aria.md` |
| icons, svg | `Documentation/components/icons.md`, `Documentation/issues/icons.md` |
| install, setup, getting started, sandbox, playground | `Documentation/01-getting-started.md`, `Documentation/02-installation.md`, `Documentation/playgrounds.md` |
| test, vitest, coverage, @vue/test-utils | `lib/{component}/{Name}.test.ts` (читай существующий тест трогаемого компонента, чтобы соблюсти стиль) |
| **always** (every ТЗ) | `Documentation/dev-patterns.md`, `Documentation/issues/README.md`, `Documentation/README.md` |

Если роутинг даёт ноль совпадений и ТЗ действительно тривиальный (например, «опечатка в строковом литерале»), можно перейти к шагу 5 с однострочным планом. Иначе — добавляй строки или попроси пользователя уточнить, какую подсистему ТЗ затрагивает.

---

## Step 3 — READ docs

Прочитай каждый файл из TodoWrite. Предпочти `mcp__trace-mcp__get_feature_context` для keyword-driven выдержек, когда документ длинный; `Read` — для коротких. Для существующего кода компонента используй `mcp__trace-mcp__get_outline` на `lib/{name}/{Name}.vue` / `{Name}.d.ts` / `{Name}.test.ts` — это дешевле, чем `Read` всего файла.

Помечай каждый пункт TodoWrite `completed` только после фактического чтения файла.

**Не переходи к шагу 4, пока остаётся хоть один pending `Read docs: …`.** Это правило отличает `/tz` от ad-hoc работы.

---

## Step 4 — VALIDATE against canon + known issues

Авторитетные источники для инвариантов:

1. **`Documentation/dev-patterns.md` §2 (Decisions)** — канон по:
   - инициализация стилей через `Component.__hooks()` (не дублировать `onMounted(() => X.initStyle())` в SFC),
   - импорты: внутренние — относительные `./{Name}`; cross-component — `fishtvue/{name}`,
   - `{Name}Emits = null` если эмитов нет (не пустой `defineEmits()`),
   - обязательная `class X extends ClassComponent<...>` + `declare module "vue"` декларация в `.d.ts`,
   - `const` (не `ref`) для словарей Tailwind-классов,
   - resolve опций — `props ?? options ?? defaults` через `??`, default — литерал.
2. **`Documentation/issues/README.md`** — cross-cutting findings (XSS via `v-html`, отсутствующий aria, и т.д.).
3. **`Documentation/issues/{target}.md`** — issues по конкретному трогаемому компоненту/модулю.

Для каждого требования в ТЗ задай вопросы:

1. **Противоречит канону?** напр. «инициализировать стиль в `onMounted` SFC» — противоречит решению §2 о `Component.__hooks()`.
2. **Нарушает invariant?** напр. «использовать пустой `defineEmits()`» — нарушает требование `Emits = null`.
3. **Воскрешает закрытый issue или вводит уже зафиксированный антипаттерн?** напр. ТЗ просит «вставить пользовательский HTML через `v-html`» при существующем cross-cutting XSS-finding в `issues/README.md`.
4. **Меняет публичный API без явных type-сигнатур в спеке?** Красный флаг — спецификация должна задавать новые `Props`/`Emits`/`Slots` явно.

### If conflicts found

**STOP.** Выведи структурированный отчёт:

```
## ⚠️ Conflicts with FishtVue canon / known issues

### Conflict 1: <short title>
- **Spec says:** <quote from ТЗ>
- **Existing rule:** <quote from dev-patterns.md §<n> or issues/<file>.md Issue <n>>
- **Why it matters:** <impact — broken canon, regressed XSS guard, нарушен tree-shaking, сломан typing и т.д.>
- **Recommendation:** <revise spec / accept change with explicit override / split into two specs>

### Conflict 2: ...

---

Resolve these before I draft the implementation plan.
```

Жди, пока пользователь пересмотрит ТЗ или явно подтвердит override. Не продолжай.

### If no conflicts

Переходи к шагу 5.

---

## Step 5 — PLAN (ExitPlanMode)

Составь план, который покрывает:

1. **Files to modify** — список `lib/**/*.{vue,ts,d.ts}` (плюс при необходимости `lib/component/index.ts`, `lib/theme/...`, `lib/locale/...`), одна строка комментария на файл.
2. **Tests to add/update** — `lib/{component}/{Name}.test.ts` (Vitest 4 + `@vue/test-utils`), перечисли happy / error / boundary / a11y / XSS-guard кейсы.
3. **Docs to update** — `Documentation/{components|utilities|architecture}/{name}.md` из роутинга шага 2; что именно править (prose, examples, anchors, frontmatter `updated`).
4. **Issues entry** —
   - если ТЗ **закрывает** пункт из `Documentation/issues/{target}.md` — отметить как resolved (зачёркивание + пометка `✅ resolved in <commit-or-date>`); пересчитать матрицу в `Documentation/issues/README.md`.
   - если ТЗ **вводит** новое известное ограничение — добавить новую запись в `issues/{target}.md` с severity и обновить матрицу.
5. **Conventional commit draft** — одна строка: `feat(<scope>): …` / `fix(<scope>): …` / `refactor(<scope>): …` / `docs(<scope>): …`. Это и есть «changelog entry» — `CHANGELOG.md` генерируется `@semantic-release/changelog` из истории Conventional Commits, **руками не редактируется**.
6. **Verification commands** — конкретный bash для запуска в шаге 9 (см. шаблон ниже).

Используй `ExitPlanMode` для запроса approval.

---

## Step 6 — TESTS FIRST (after plan approval)

После approval плана:

1. Для каждого затронутого исходника применяй `mcp__trace-mcp__get_outline` и `mcp__trace-mcp__get_symbol`, чтобы понять текущую реализацию.
2. `mcp__trace-mcp__find_usages` — кто импортирует / расширяет то, что ты собираешься править (особенно для `lib/component/`, `lib/theme/`, утилит).
3. Пиши новые тесты **до** изменения реализации. Покрытие:
   - **Happy path** — новое требование работает как описано.
   - **Props option-resolution** — defaults, через `Component`-options, через явный prop (все слои `props → options → defaults`).
   - **Slots** — default + named, fallback content.
   - **Emits** — `expect(wrapper.emitted('<event>')).toEqual([[<payload>]])`.
   - **Reactivity / watchers** — изменение props/options пробрасывается.
   - **Accessibility** — наличие `role`, `aria-*`, focus management, keyboard handlers (если применимо).
   - **XSS guard** — если код использует `v-html`, тест на санитизацию.
   - **Boundary** — пустой ввод, max values, `null`/`undefined` опции.
4. Запусти новые тесты: `pnpm test -- {Name}.test.ts` (или `pnpm test -- -t "<test name>"`). Они **должны падать** (red). Если зелёные — тест неправильный (не утверждает новое поведение) — поправь тест.

---

## Step 7 — IMPLEMENT

Сделай изменение в коде. Минимальная дельта, превращающая красные тесты в зелёные. Затем:

1. `pnpm test -- {Name}.test.ts` — должно быть зелёным.
2. `pnpm typecheck` — обязательно. `vue-tsc` ловит регрессии в `Props` / `Slots` / `Emits` / `Expose`, которые Vitest может пропустить.
3. Добавь регрессионные / helper-тесты, если шаг 6 что-то упустил.
4. Прогоняй тестовый файл целиком ещё раз: `pnpm test -- lib/{component}/{Name}.test.ts`.

---

## Step 8 — UPDATE DOCS

Для каждого `Documentation/**/*.md` из роутинга шага 2:

1. **Update prose** — описание изменённого поведения, новые props/slots/emits, обновлённые examples.
2. **Update line-number anchors** — после правок в `lib/` номера строк могут сдвинуться. Используй `mcp__trace-mcp__get_symbol`, чтобы получить актуальные `line_start` / `line_end`, и обнови ссылки. В репо встречаются оба стиля:
   - `[Button.vue:346](../lib/button/Button.vue#L346)` (issues и cross-refs),
   - `[component/index.ts:79–84](../lib/component/index.ts#L79-L84)` (диапазоны).
   Сохраняй стиль, который уже использует трогаемый документ.
3. **Update `Documentation/issues/{target}.md`** — зачеркни (`~~текст~~`) или помечай `✅ resolved` пункты, которые ТЗ закрыло; добавь новые findings, если ТЗ вводит новое ограничение.
4. **Update `Documentation/issues/README.md`** — если матрица severity-counts изменилась (resolved / new), пересчитай строку для затронутого target и `TOTAL`.
5. **Update frontmatter `updated:`** — ISO date (например `2026-05-10`) во всех правленых документах.
6. **НЕ редактируй `CHANGELOG.md`.** Это файл semantic-release. История изменений приходит из commit-сообщений по Conventional Commits.

---

## Step 9 — SYNC CHECK

Прогон 4 проверок. Чини всё красное:

```bash
pnpm typecheck                                # vue-tsc проходит
pnpm test -- lib/{component}/{Name}.test.ts   # новые тесты зелёные
pnpm lint:fix && pnpm format                  # ESLint/Prettier — стейдж любых правок
# Manual anchor sanity-check:
#   для каждого изменённого символа в lib/** убедись, что
#   ссылки [...](../lib/.../File.vue#L<N>) и [File.vue:N] в трогаемых
#   Documentation/**/*.md указывают на актуальные строки
#   (используй mcp__trace-mcp__get_symbol).
```

Если husky `pre-commit` или `commit-msg` падает — **чини root cause**, не используй `--no-verify`. Если ESLint/Prettier выдали авто-фикс — это нормально, заcommit'и фикс.

`pnpm coverage` запускай по запросу пользователя или если ТЗ затрагивает критичный модуль (`lib/component/`, `lib/theme/`, `lib/form/`).

---

## Step 10 — REPORT

Закончи структурированной сводкой:

```markdown
## ✓ ТЗ implemented

### Code
- `lib/<comp>/<Name>.vue` — <one-line>
- `lib/<comp>/<Name>.d.ts` — <one-line>

### Tests
- `lib/<comp>/<Name>.test.ts` — N tests, all green

### Docs updated
- `Documentation/components/<name>.md` — <what changed>
- `Documentation/issues/<name>.md` — Issue <n> ✅ resolved / new finding added
- `Documentation/issues/README.md` — severity matrix updated (если применимо)

### Verification
- `pnpm typecheck`: ✓
- `pnpm test -- <Name>.test.ts`: ✓ N passed
- `pnpm lint:fix && pnpm format`: ✓ clean
- Anchor sanity-check: ✓

### Conventional commit (draft)
<type>(<scope>): <summary>

ТЗ done. Ready for commit.
```

После этого — стоп. Не коммить, пока пользователь не попросит. Когда попросит — commit-сообщение **обязательно** соответствует Conventional Commits (`@commitlint/config-conventional`), иначе husky `commit-msg` отклонит.

---

## Hard rules (non-negotiable)

- **Никаких правок в `lib/**` и `Documentation/**` на шагах 1–5.** Plan mode обязателен. Если начал редактировать на этапе research — стоп, откати, перезайди в plan mode.
- **Никогда не пиши тесты после реализации.** Tests-first — правило. Смысл — зафиксировать поведение в тестах; писать их после уничтожает смысл.
- **Не пропускай чтение `dev-patterns.md` + `issues/README.md` в шаге 4.** Даже для «тривиальных» изменений — оба документа короткие, прочитать дёшево.
- **Не оставляй doc-anchor (`#L<N>` или `:N`), указывающий на строку, которую ты сдвинул.** Анкеры здесь не валидируются автоматически (нет `doc-sync`), поэтому ответственность на тебе. Прогоняй mental check + `mcp__trace-mcp__get_symbol` для подтверждения.
- **Не редактируй `CHANGELOG.md` руками.** Это semantic-release territory. Изменения истории идут через Conventional Commits → авто-генерация на release.
- **Не коммить за пользователя.** Шаг 10 рапортует; решение о коммите за пользователем.
- **Не используй `--no-verify` / `--no-gpg-sign` для обхода husky.** Если pre-commit или commit-msg хук падает — чини причину.

Если на каком-то шаге возникает соблазн пропустить «потому что мелочь» — не пропускай. Смысл `/tz` в том, чтобы применять одну дисциплину независимо от размера задачи: команда тогда может доверять выходу.
