---
title: Playgrounds (sandbox & sandbox-nuxt)
summary: Назначение и workflow двух песочниц для экспериментов и regression-репро.
updated: 2026-05-09
---

# Playgrounds (sandbox & sandbox-nuxt)

## 1. Purpose

Два пакета в монорепе — `sandbox` и `sandbox-nuxt` — это **чёрные ящики для экспериментов**: ручная проверка нового компонента, воспроизведение багов, изоляция проблемы перед написанием регрессионного теста.

Они **НЕ являются источником паттернов** для библиотеки и **НЕ копируются в документацию** в качестве примеров. Канон — только [lib/](../lib). Внутренняя документация в [Documentation/](.) использует только fenced code blocks с компилируемыми против реального публичного API сниппетами.

## 2. When to use which

- **`sandbox`** ([sandbox/](../sandbox)) — Vite + Vue 3, JavaScript. Минимальная конфигурация без TypeScript, без SSR. Подходит для:
  - Быстрой пробы новой идеи.
  - Проверки UX-сценария на реальном компоненте.
  - Воспроизведения SPA-бага.
- **`sandbox-nuxt`** ([sandbox-nuxt/](../sandbox-nuxt)) — Nuxt 4 проект. Подходит для:
  - Проверки интеграции с Nuxt — auto-import, layers, server routes, SSR.
  - Тестирования модуля `fishtvue/module` и плагина `fishtvue/plugins/nuxt`.
  - Воспроизведения SSR/hydration-багов.

Если нужно проверить behavior в Nuxt 3 (а не 4) — установи `nuxt: "^3.x"` в `sandbox-nuxt/package.json` локально и не коммить change.

## 3. How to run

```bash
# Vite-песочница
pnpm sandbox:dev

# Nuxt 4 песочница
pnpm --filter sandbox-nuxt dev
```

Обе песочницы импортируют `fishtvue` через workspace-link — изменения в `lib/` подхватываются hot-reload без отдельной сборки.

## 4. Workflow

1. Создай файл в `sandbox/src/components/` (или `sandbox-nuxt/components/` для Nuxt). Имя — короткое, описательное.
2. Импортируй компонент из `fishtvue/{name}` (точечный импорт). Не из barrel `fishtvue` — для tree-shake-проверки в Nuxt.
3. Воспроизведи сценарий. Минимизируй до 30-50 строк.
4. Если нашёл проблему — пиши **регрессионный тест** в `lib/{name}/{Name}.test.ts` (Vitest 4 + `@vue/test-utils`).
5. **Не коммить** experiment-код в качестве документационного примера. Demo для публичного сайта живут в `/docs/components/demo/` (Nuxt Content) — отдельный workflow, не часть `Documentation/`.

## 5. Caveats

- `sandbox-nuxt` использует Nuxt 4 — поведение auto-import и layers может отличаться от:
  - публичного сайта `docs/` (Nuxt 3),
  - Nuxt 3 проекта пользователя.
- Версии `fishtvue` в песочницах могут отставать от `lib/` — это **допустимо** (workspace-link обычно подхватывает актуальную версию, но при ручной правке `package.json` песочницы возможны рассинхроны).
- README'ы внутри песочниц минимальны — этот документ единственный источник истины об их назначении.

## 6. Known issues

На момент ревизии (2026-05-09) известных проблем нет.

Если найдёшь sandbox-bug, влияющий на воспроизведение, заведи issue на [github.com/Egoka/FishtVue/issues](https://github.com/Egoka/FishtVue/issues) с минимальным repro и тегом `sandbox`.
