---
title: Issues — VirtualScroller
summary: Аудит VirtualScroller — 23-й компонент библиотеки, до 2026-09-05 отсутствовал в сводке целиком. Единственная позиция (coverage) закрыта в тот же день: 73.35 / 56.28 → 86.1 / 72.13. Остальные категории 60-пунктового чек-листа закрыты или неприменимы.
updated: 2026-09-05
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/virtualscroller/
related-doc: ../components/virtualscroller.md
---

# Issues — VirtualScroller

## Сводка

| Severity | Count | Categories                                    |
| -------- | ----- | --------------------------------------------- |
| critical | 0     | —                                             |
| high     | 0     | —                                             |
| medium   | 0     | ~~J46 (coverage ниже порога)~~ ✅ 2026-09-05  |
| low      | 0     | —                                             |

**Почему файл появился только 2026-09-05.** Компонент добавлен 2026-06-13 как dependency-free примитив для разблокировки виртуализации Select ([select.md Issue 7](./select.md)). Он попал в публичный barrel, в `VirtualScrollerOption`, в Nuxt-регистрацию, в locale-ключи, в [components/virtualscroller.md](../components/virtualscroller.md) и в [specs/virtualscroller.md](../specs/virtualscroller.md) — но не в сводку аудита. Расхождение зафиксировано в [closure-assessment.md](./closure-assessment.md) §3 поз. 14 и закрыто doc-sync'ом.

## ~~Issue 1: coverage ниже проектного порога~~ ✅ resolved 2026-09-05

- **Категория:** J46
- **Severity:** ~~medium~~
- **Где:** [VirtualScroller.vue](../../lib/virtualscroller/VirtualScroller.vue)

### Что найдено

Прогон на 2026-09-05:

| Файл                    | Stmts     | Branch    |
| ----------------------- | --------- | --------- |
| `VirtualScroller.vue`   | **73.35** | **56.28** |
| `useVirtualScroll.ts`   | 95.23     | 81.15     |
| каталог целиком         | 79.67     | 63.09     |

Проектный порог — 80 % statements / 70 % branch (acceptance-критерий Wave 11 в [README.md](./README.md)). Headless-composable его проходит с запасом, SFC — нет.

### Почему это проблема

Непокрытые ветки лежат в области, где ошибка наименее заметна на глаз: пересчёт окна при variable-height элементах, обработка `scrollToIndex` у краёв списка, grid-режим. Регрессия здесь проявится «съехавшим» скроллом на конкретном размере данных, а не падением.

Отдельно: компонент — фундамент для [select.md Issue 7](./select.md) (виртуализация dropdown). Интегрировать в Select примитив, у которого не покрыт пересчёт окна, — значит унаследовать риск в куда более используемый компонент.

### Что нужно сделать

1. Поднять `VirtualScroller.vue` до ≥80 / ≥70: variable-height пересчёт, `scrollToIndex` на границах, grid-режим.
2. Прогнать вместе с интеграцией в Select — часть веток удобнее закрывать уже на реальном потребителе.

### Что сделано (2026-09-05)

Заведён [VirtualScrollerModes.test.ts](../../lib/virtualscroller/VirtualScrollerModes.test.ts) — 23 кейса на те режимы, которых базовая суита не касалась: grid-раскладка, горизонтальная ось, отложенный `scroll`-эмит, гейт `lazy-load`, императивные методы скролла и снятие слушателей при unmount.

| Файл                  | Было          | Стало         |
| --------------------- | ------------- | ------------- |
| `VirtualScroller.vue` | 73.35 / 56.28 | **86.1 / 72.13** |
| каталог               | 79.67 / 63.09 | **88.73 / 75** |

Две вещи, стоившие итераций и полезные тому, кто будет писать сюда тесты дальше:

- **Размеры viewport'а надо подставлять на `HTMLElement.prototype` до `mount`.** jsdom не считает layout, а `measureViewport()` читает `clientHeight`/`clientWidth` уже в `onMounted` — подмена на самом элементе после монтирования не доезжает, окно остаётся нулевым, и grid не может посчитать число колонок.
- **Виртуализация включается только при `items.length > threshold`, а `threshold` по умолчанию 100.** На коротком списке `useWindow` остаётся `false`, и `lazy-load` молчит по построению — в тестах нужен явный `threshold`.

Попутно найден ложноположительный кейс в базовой суите: проверка «отрендерено меньше 200 строк» проходила и при **нуле** отрендеренных, потому что слот для элементов называется `item`, а в тесте передавался `default`. Добавлена нижняя граница.

### Acceptance criteria

- [x] `lib/virtualscroller` ≥ 80 % statements / ≥ 70 % branch ✅ 2026-09-05 — 88.73 / 75.

## Cross-cutting: Configuration support

| Настройка              | Поддержано? | Комментарий                                                     |
| ---------------------- | ----------- | --------------------------------------------------------------- |
| `componentsOptions`    | ✅          | `VirtualScrollerOption` в [FishtVue.d.ts](../../lib/config/FishtVue.d.ts) |
| `unstyled: true`       | ✅          | через общий guard `Component.setStyle()`                        |
| `locale`               | ✅          | ключ `virtualScroller.loading`                                  |
| SSR / `sideEffects`    | ✅          | наследуется от корневого пакета (волна 2)                       |

## Dual-API gap

Неприменимо: VirtualScroller — примитив с единственным API (`:items` + scoped slot), collection-компонентом в смысле [README.md](./README.md) §P не является.
