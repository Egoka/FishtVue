---
title: Closure progress — журнал закрытия сводки
summary: Живой журнал выполнения плана из closure-assessment.md. Разбивка батчей на подзадачи, принятые решения, коммиты, корректировки плана по ходу работы.
updated: 2026-09-05
---

# Closure progress — журнал закрытия сводки

Исполнительный журнал к [closure-assessment.md](./closure-assessment.md). Аудит отвечает на вопрос «сколько осталось», этот файл — «что уже сделано и чем именно».

**Старт сессии:** 2026-09-05, ветка `chore/claude-workflow-init`, база `9f6b683`.

> **Разделение ответственности.** Source-of-truth прогресса по numbered issues — чекбоксы Fix roadmap в [README.md](./README.md). Здесь — трассировка «подзадача → коммит», чтобы через месяц было понятно, почему конкретная строка roadmap оказалась закрыта.

---

## Решения, принятые в начале сессии

Зафиксированы до старта работ, определяют содержание T1–T3.

| #   | Вопрос                                                                                            | Решение                                                                                                                          |
| --- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| R1  | `AGENTS.md` (untracked копия CLAUDE.md для Codex)                                                 | **Трекать + синхронизировать.** Регламент синхронизации внести в CLAUDE.md, чтобы расхождение не накапливалось                    |
| R2  | Nuxt-опция `disableGlobalStyles` — объявлена, но нигде не читается (no-op)                        | **Реализовать.** При `true` не регистрировать server-плагин `plugins/nuxt.mjs`, то есть отключать SSR-инжект глобального baseStyle |
| R3  | `pnpm lint` в CI = `eslint --fix .` — мутация вместо проверки                                     | **Чинить.** Новый скрипт `lint:check` = `eslint .`; оба workflow переводятся на него; `lib:build` в PR-workflow раскомментировать |
| R4  | `packageManager` поднят до `pnpm@11.23.0` в рабочем дереве                                        | **Коммитить** + удалить мёртвый блок `pnpm.onlyBuiltDependencies` (pnpm 11 его игнорирует, настройка живёт в `pnpm-workspace.yaml`) |

---

## Порядок выполнения

Отсортировано по «дёшево и разблокирует остальное» → «дорого».

| Задача | Батч из assessment | Статус | Коммит |
| ------ | ------------------ | ------ | ------ |
| T1. Tooling hygiene + CI gate | B17 + N6 + N8 + R1–R4 | ✅ | `chore(tooling)` |
| T2. Nuxt: compound-дети в auto-import | B15 (N1) | ✅ | `fix(nuxt-module)` |
| T3. Nuxt: dead code + `disableGlobalStyles` | B16 (N2, N3) | ✅ | `fix(nuxt-module)` |
| T4. TextEditor: native form submit | B3 | ✅ | `feat(texteditor)` |
| T10. TextEditor: разблокировать тест-суиту | Wave 11 / C2 (не было в плане сессии) | ✅ | `feat(texteditor)` |
| T5. Label: translate px → CSS custom properties | B2 | ⏳ | — |
| T6. TextEditor: локализация hardcoded-строк | B12 частично (N4) | ⏳ | — |
| T7. TextEditor: `darkModeSelector` | N5 | ⏳ | — |
| T8. `arrayHandler.sort` — документировать | B4 | ⏳ | — |
| T9. Doc-sync: 22 позиции §3 + матрица + roadmap | B13 + B1 + N7 | ⏳ | — |

Не входит в сессию (эпики и длинные волны): C1, C2, C5, C7, C9, B5–B11, B18, D1–D4. Причина — объём, см. [closure-assessment.md §7.1](./closure-assessment.md).

---

## T1. Tooling hygiene + CI gate

**Батчи:** B17, находки N6 / N8, решения R1–R4.
**Цель:** убрать шум и дыры в quality-gate до того, как по нему пойдут остальные задачи.

| Подзадача | Что делаем | Файл |
| --------- | ---------- | ---- |
| T1.1 | Закоммитить bump `packageManager` до `pnpm@11.23.0` (R4) | `package.json` |
| T1.2 | Удалить мёртвый блок `pnpm.onlyBuiltDependencies` — источник `[WARN]` в каждой команде (R4) | `package.json` |
| T1.3 | Добавить скрипт `lint:check` = `eslint .` без `--fix` (R3) | `package.json` |
| T1.4 | Перевести CI-шаг «Lint library» на `lint:check` в обоих workflow (R3) | `.github/workflows/{pull_request,release}.yml` |
| T1.5 | Раскомментировать `lib:build` в PR-workflow — сборка не проверялась на PR (R3) | `.github/workflows/pull_request.yml` |
| T1.6 | Исключить `theme/unoStyle/test-helpers*.ts` из coverage — тест-хелперы занижали агрегат (N6) | `vite.config.ts` |
| T1.7 | Добавить `VirtualScroller` в список компонентов issue-labeler (N8) | `.github/workflows/issue-labeler.yml` |
| T1.8 | Затрекать `AGENTS.md` + внести регламент синхронизации с CLAUDE.md (R1) | `AGENTS.md`, `CLAUDE.md` |
| T1.9 | Удалить артефакт `Documentation/issues/coverage/` (gitignored мусор от прошлого аудита) | — |

**Результат.** `[WARN]` про `pnpm.onlyBuiltDependencies` больше не печатается ни на одной команде. Coverage-агрегат поднялся **88.22 / 78.68 / 89.56 / 91.98 → 89.72 / 79.40 / 92.04 / 93.71** — тест-хелперы движка действительно занижали цифру, реальное покрытие библиотеки было выше заявленного. Тесты: 5716 passed, без изменений.

**Сверх плана в T1:**

- `VirtualScroller` добавлен не только в issue-labeler, но и в dropdown-списки всех трёх issue-шаблонов (`bug_report` / `feature_request` / `question`) — там был тот же захардкоженный список из 22 компонентов.
- Счётчик «22 компонента» в agent-guide исправлен на 23 сразу (N7), чтобы не трогать `CLAUDE.md` второй раз в T9.
- Раздел «Два agent-guide» написан **байт-идентичным** в обоих файлах: вместо таблицы сопоставления (она вырождалась при генерации `AGENTS.md` через `sed`) — прозаическое описание плюс sync-check, нормализующий оба файла к общему виду. Расхождение между файлами сведено ровно к двум строкам с путями.

---

## T2. Nuxt: compound-дети в auto-import

**Батч:** B15, находка N1.
**Проблема:** `FISHT_VUE_SUBCOMPONENTS` не содержит `MenuItem`/`MenuGroup`/`AccordionItem`, хотя barrel'ы их экспортируют, а `02-installation.md` обещает «В Nuxt — глобальны».

| Подзадача | Что делаем |
| --------- | ---------- |
| T2.1 | Добавить три записи в `FISHT_VUE_SUBCOMPONENTS` |
| T2.2 | Завести `lib/module/nuxt.test.ts` — регистрация компонентов через мок `@nuxt/kit` |
| T2.3 | Тест-инвариант: каждый named-экспорт compound-barrel'ов присутствует в списке (защита от повторения) |

---

## T3. Nuxt: dead code + `disableGlobalStyles`

**Батч:** B16, находки N2 / N3, решение R2.

| Подзадача | Что делаем |
| --------- | ---------- |
| T3.1 | Реализовать `disableGlobalStyles`: при `true` не вызывать `addPlugin` для server-стилей (R2) |
| T3.2 | Удалить `getNuxtVersion`/`isNuxt4`/`createRequire` — обе ветки `importPath` одинаковы (N3). Закрывает `nuxt-module.md` Issue 2 |
| T3.3 | Тесты на обе ветки `disableGlobalStyles` |

**Результат T2 + T3.** Один тест-файл на 11 тестов покрыл оба батча: `lib/module` **0% → 100% stmts / 75% branch**, агрегат по проекту 89.72 → **90.11 / 79.48 / 92.35 / 94.11**. Закрыты `nuxt-module.md` Issues 1 (частично — `lib/plugins` остаётся), 2 и 5. Синхронизированы [architecture/nuxt-module.md](../architecture/nuxt-module.md) и [02-installation.md](../02-installation.md).

**N11 — находка, вскрытая первым же прогоном теста.** `lib/module/nuxt.ts` импортировал `join`/`dirname` из голого `"path"`, а в devDependencies монорепозитория лежит legacy-пакет **`path@0.12.7`**, который перехватывает спецификатор и падает на современном Node: `TypeError: util.isString is not a function`. Файл рядом уже использовал `node:url`, то есть импорт был просто непоследовательным. Исправлено на `node:path`.

Находка показательна тем, что это **прямое следствие нулевого покрытия**: модуль ни разу не исполнялся в тестах, поэтому падение не всплывало. Сам пакет `path@0.12.7` из devDependencies не трогали — он может использоваться сборочными скриптами; проверка остальных потребителей голого `"path"` вынесена в открытые вопросы.

**Корректировка плана.** B15 и B16 в assessment оценивались как 0.25–0.5 д и 0.5–1 д раздельно. Фактически они склеились в один PR (общий тест-файл, общий файл кода) и заняли меньше — но добавили N11, которого в плане не было.

---

## T4 + T10. TextEditor: native form submit и разблокировка тест-суиты

**Батчи:** B3; сверх плана — содержательная цель Wave 11 и половина эпика C2.

| Подзадача | Что делаем |
| --------- | ---------- |
| T4.1 | Скрытый `<input type="hidden" :name="id">` в `#default`-слот, значение из локального `modelValue` |
| T4.2 | Тесты native submit через реальный `new FormData(form)` |
| T10.1 | Стаб Quill через `vi.mock("@vueup/vue-quill")` + хелпер `mountEditor()` |
| T10.2 | Снять `describe.todo` с основного блока |
| T10.3 | Перевести legacy-тесты на асинхронный mount |
| T10.4 | Синхронизировать `texteditor.md` и `components/text-editor.md` |

**Результат.** `TextEditor.vue` **0% → 95.89% stmts / 85.18% branch / 92.85% funcs**, тесты **27/27, 0 todo** (было 0 исполняемых из 17). Агрегат по проекту 90.11 → **91.04 / 80.34 / 93.76 / 95.10** — branch впервые перешагнул 80%. Закрыты `texteditor.md` Issues 1 и 10.

**Почему это оказалось дёшево, хотя в assessment числилось эпиком C2 (4–7 д).** Рецепт был записан в roadmap с самого начала — `vi.mock("@vueup/vue-quill")`. Невыполнимым он был до Wave 2.1: пока Quill импортировался статически, подмена не успевала. После перевода на `await import()` в `onMounted` стаб перехватывает загрузку, и настоящий Quill не создаёт своих `requestAnimationFrame`-колбэков — тех самых, что стреляли после teardown jsdom и роняли прогон. То есть блокер сняла чужая волна, а roadmap об этом не узнал.

**Ошибка аудита, которую это вскрыло.** [closure-assessment.md](./closure-assessment.md) §3 поз. 11 утверждала: «0 `it.skip`, 15 живых тестов, `vi.mock` отсутствует — формулировка задачи устарела». Неверно: блок был под `describe.todo`, тестов ровно 17, как и говорил roadmap, а предложенный им `vi.mock` был правильным решением. Ошибка счёта возникла из-за того, что `describe.todo` не даёт `it.skip` в исходнике. Позиция снята из §3.

**Две технические детали, стоившие итераций:**

- фабрика `vi.mock` хойстится выше импортов файла — `defineComponent`/`h` приходится брать через `await import("vue")` внутри неё, иначе `ReferenceError: Cannot access '__vi_import_4__' before initialization`;
- нужны **два** `flushPromises()` подряд: в `onMounted` последовательно резолвятся `await import("@vueup/vue-quill")` и `Promise.all([...css])` — разные микротаск-очереди.

**Попутная находка N12.** Mount выдал `[Vue warn]: received a Component that was made a reactive object` — определение компонента лежало в глубоко-реактивном `ref`. Переведено на `shallowRef`.

**Находка N13 — кросс-файловая утечка, поймана pre-commit'ом.** Суита проходила при прямом запуске, но валилась на husky-хуке: `FixWindow.test.ts` падал с `TypeError: Cannot read properties of null (reading 'insertBefore')` плюс 23 unhandled-ошибки. Причина — `isolate: false` в [vite.config.ts](../../vite.config.ts): воркер переиспользует одно jsdom-окружение на несколько файлов. TextEditor тянет за собой InputLayout с mount-tick'ом на `setTimeout(100)`; тест завершается за ~5 мс, инстанс остаётся живым, таймер срабатывает уже во время следующего файла — когда документ подменён. Лечится `enableAutoUnmount(afterEach)`.

Практический вывод: **добавляя mount-тесты к компоненту, который раньше не монтировался, всегда ставь авто-unmount** — при `isolate: false` цена забытого инстанса ложится на чужой файл, и локальный прогон одного файла её не покажет. Стабильность подтверждена тремя полными прогонами подряд.

---

## Журнал изменений плана

Сюда попадает всё, что разошлось с [closure-assessment.md](./closure-assessment.md) по ходу работы.

- **2026-09-05, старт.** Найдены три новые позиции при чтении CI-конфигов, отсутствующие в assessment: **N8** (issue-labeler хардкодит 22 компонента без `VirtualScroller`), **N9** (`pnpm lint` в CI — это `eslint --fix`, гейт не может упасть на автофиксимой ошибке), **N10** (`pnpm lib:build` закомментирован в PR-workflow — rollup-сборка не проверяется до релиза). Все три включены в T1 вместо заведения отдельных батчей.
- **2026-09-05, T10.** Эпик **C2 (TextEditor, 4–7 д, «высокий риск»)** ужался: его самая дорогая часть — coverage 0% при заблокированной суите — закрыта за одну итерацию. Остаток C2: Quill toolbar i18n (Issues 8, 9 + N4), `image-upload-request` handler (Issue 6), `darkModeSelector` (N5). Переоценка: **1.5–3 д вместо 4–7**, риск с высокого на низкий — mock-харнесс уже есть. Это меняет критический путь всей сводки: C2 был его самым длинным звеном.
- **2026-09-05, T10.** Позиция 11 в §3 assessment признана **ошибочной** и снята: тесты были `describe.todo` (17 штук, счёт roadmap верный), а не «15 живых без vi.mock».
- **2026-09-05, T4.** Находка **N12**: определение lazy-загружаемого Quill хранилось в глубоко-реактивном `ref` → Vue-warn. Переведено на `shallowRef`.
- **2026-09-05, T2/T3.** Новая находка **N11**: голый импорт `"path"` в `lib/module/nuxt.ts` перехватывался legacy-пакетом `path@0.12.7` из devDependencies и падал на современном Node. Исправлено на `node:path`. В assessment не значилась — обнаружилась только при первом исполнении модуля под тестом.
- **2026-09-05.** Выяснено, что `pnpm-workspace.yaml` **gitignored** и генерируется в CI (комментарий в workflow: иначе ломается Vercel-деплой `docs/` с Root Directory = `docs`). Это подтверждает безопасность удаления `pnpm.onlyBuiltDependencies` из package.json — поле мёртвое с обеих сторон.
