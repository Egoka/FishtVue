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
| T1. Tooling hygiene + CI gate | B17 + N6 + N8 + R1–R4 | ⏳ | — |
| T2. Nuxt: compound-дети в auto-import | B15 (N1) | ⏳ | — |
| T3. Nuxt: dead code + `disableGlobalStyles` | B16 (N2, N3) | ⏳ | — |
| T4. TextEditor: native form submit | B3 | ⏳ | — |
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

---

## Журнал изменений плана

Сюда попадает всё, что разошлось с [closure-assessment.md](./closure-assessment.md) по ходу работы.

- **2026-09-05, старт.** Найдены три новые позиции при чтении CI-конфигов, отсутствующие в assessment: **N8** (issue-labeler хардкодит 22 компонента без `VirtualScroller`), **N9** (`pnpm lint` в CI — это `eslint --fix`, гейт не может упасть на автофиксимой ошибке), **N10** (`pnpm lib:build` закомментирован в PR-workflow — rollup-сборка не проверяется до релиза). Все три включены в T1 вместо заведения отдельных батчей.
- **2026-09-05.** Выяснено, что `pnpm-workspace.yaml` **gitignored** и генерируется в CI (комментарий в workflow: иначе ломается Vercel-деплой `docs/` с Root Directory = `docs`). Это подтверждает безопасность удаления `pnpm.onlyBuiltDependencies` из package.json — поле мёртвое с обеих сторон.
