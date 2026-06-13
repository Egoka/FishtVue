import { CSSProperties, Ref, VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, StyleClass } from "../types"

/**
 * ## VirtualScroller
 *
 * VirtualScroller — низкоуровневый примитив виртуализации списков (windowing): рендерит только
 * видимое подмножество большого массива внутри скролл-контейнера. Поддерживает переменную высоту
 * элементов (fixed / функция / `"auto"`-замер), три ориентации (`vertical`/`horizontal`/`both`-grid),
 * infinite-scroll (`lazy` + emit `lazy-load`) и `appendOnly`-ленту. Полоса прокрутки — enhanced-native
 * в стиле macOS (см. prop `scrollbar`).
 *
 * Тип элемента не параметризован на уровне `GlobalComponents` (ограничение Vue template-types):
 * `item`/`items` типизированы как `any`. При программном использовании через template-ref можно
 * сузить тип на стороне потребителя.
 */
declare class VirtualScroller extends ClassComponent<
  VirtualScrollerProps,
  VirtualScrollerSlots,
  VirtualScrollerEmits,
  VirtualScrollerExpose
> {}

// ---------------------------------------

/**
 * Ось виртуализации.
 * @type {"vertical" | "horizontal" | "both"}
 */
export declare type VirtualScrollerOrientation = "vertical" | "horizontal" | "both"

/**
 * Режим полосы прокрутки. `"macos"` — overlay (idle скрыт, появляется на hover/scroll, гаснет);
 * `"thin"` — тонкая всегда видна, утолщается на hover/scroll; `"native"` — системная без стилей;
 * `"hidden"` — скрыта полностью.
 * @type {"macos" | "thin" | "native" | "hidden"}
 */
export declare type VirtualScrollerScrollbar = "macos" | "thin" | "native" | "hidden"

/**
 * Размер элемента: фиксированное число (px), функция от индекса/элемента, либо `"auto"`
 * (замер через `ResizeObserver`).
 * @type {number | ((index: number, item: any) => number) | "auto"}
 */
export declare type VirtualScrollerItemSize = number | ((index: number, item: any) => number) | "auto"

/**
 * Направление скролла в payload события `scroll`.
 * @type {"up" | "down" | "left" | "right"}
 */
export declare type VirtualScrollerScrollDirection = "up" | "down" | "left" | "right"

/**
 * Payload события `scroll`.
 */
export declare type VirtualScrollerScrollEvent = {
  /** Текущая вертикальная прокрутка контейнера. */
  scrollTop: number
  /** Текущая горизонтальная прокрутка контейнера. */
  scrollLeft: number
  /** Направление последнего скролла. */
  direction: VirtualScrollerScrollDirection
}

/**
 * Диапазон отрендеренных элементов — payload событий `scroll-index-change` и `lazy-load`.
 */
export declare type VirtualScrollerRangeEvent = {
  /** Индекс первого отрендеренного элемента (с учётом overscan). */
  first: number
  /** Индекс последнего отрендеренного элемента (exclusive верхняя граница окна). */
  last: number
}

/**
 * Props for the VirtualScroller component.
 */
export interface VirtualScrollerProps {
  /**
   * Исходный массив данных.
   * @type {any[] | undefined}
   */
  items?: any[]

  /**
   * Размер элемента вдоль оси виртуализации (для `horizontal` — ширина). Резолв
   * `props ?? options ?? "auto"`.
   * @type {VirtualScrollerItemSize | undefined}
   */
  itemSize?: VirtualScrollerItemSize

  /**
   * Оценка размера незамеренных элементов — стабилизирует `total`/скроллбар в `"auto"`/variable режиме.
   * @type {number | undefined}
   */
  estimatedItemSize?: number

  /**
   * Ось виртуализации; `"both"` — grid (виртуализация по двум осям).
   * @type {VirtualScrollerOrientation | undefined}
   */
  orientation?: VirtualScrollerOrientation

  /**
   * Высота viewport (если не задаёт родитель). Число трактуется как px.
   * @type {string | number | undefined}
   */
  scrollHeight?: string | number

  /**
   * Ширина viewport (для `horizontal`/`both`). Число трактуется как px.
   * @type {string | number | undefined}
   */
  scrollWidth?: string | number

  /**
   * Буфер элементов вне viewport с каждой стороны (PrimeVue: `numToleratedItems`).
   * @type {number | undefined}
   */
  overscan?: number

  /**
   * Порог авто-включения: при `items.length <= threshold` рендерятся все элементы (без виртуализации).
   * @type {number | undefined}
   */
  threshold?: number

  /**
   * Throttle scroll-обработчика, мс. `0` — throttle по `requestAnimationFrame`.
   * @type {number | undefined}
   */
  delay?: number

  /**
   * Infinite-scroll: данные догружает родитель по событию `lazy-load`.
   * @type {boolean | undefined}
   */
  lazy?: boolean

  /**
   * Для `lazy`: лента только растёт — `first` не отпускает уже отрендеренный хвост (фиксируется на 0).
   * @type {boolean | undefined}
   */
  appendOnly?: boolean

  /**
   * Внешний флаг загрузки — пока `true`, повторный `lazy-load` не эмитится.
   * @type {boolean | undefined}
   */
  loading?: boolean

  /**
   * Показывать встроенный loader/skeleton (или slot `loader`).
   * @type {boolean | undefined}
   */
  showLoader?: boolean

  /**
   * Стиль полосы прокрутки.
   * @type {VirtualScrollerScrollbar | undefined}
   */
  scrollbar?: VirtualScrollerScrollbar

  /**
   * Custom CSS class корневого контейнера (viewport).
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * Custom CSS class окна с элементами.
   * @type {StyleClass | undefined}
   */
  classContent?: StyleClass
}

/**
 * Slots for the VirtualScroller component.
 */
export declare type VirtualScrollerSlots = {
  /**
   * Основной шаблон одного элемента.
   * @param props.item элемент данных
   * @param props.index абсолютный индекс в `items`
   * @param props.active виден ли элемент сейчас (внутри viewport, не в overscan-зоне)
   */
  item(props: { item: any; index: number; active: boolean }): VNode[]
  /**
   * Полный контроль над разметкой окна (advanced) — альтернатива `item`.
   * @param props.items видимый срез
   * @param props.first индекс первого видимого
   * @param props.last индекс за последним видимым
   * @param props.styleContent стиль смещения окна (translate/padding)
   * @param props.getItemOptions хелпер опций для индекса
   */
  content(props: {
    items: any[]
    first: number
    last: number
    styleContent: CSSProperties
    getItemOptions: (index: number) => { index: number; active: boolean }
  }): VNode[]
  /**
   * Кастомный skeleton загрузки (иначе встроенный).
   * @param props.index индекс плейсхолдера
   */
  loader?(props: { index: number }): VNode[]
  /**
   * Контент над областью виртуализации (вне окна).
   */
  header?(): VNode[]
  /**
   * Контент под областью виртуализации (вне окна).
   */
  footer?(): VNode[]
}

/**
 * Events emitted by the VirtualScroller component.
 */
export declare type VirtualScrollerEmits = {
  /**
   * Emitted on every (throttled) scroll.
   * @param event
   * @param {VirtualScrollerScrollEvent} payload позиция и направление скролла
   */
  (event: "scroll", payload: VirtualScrollerScrollEvent): void

  /**
   * Emitted when the visible range changes.
   * @param event
   * @param {VirtualScrollerRangeEvent} payload новый диапазон `{ first, last }`
   */
  (event: "scroll-index-change", payload: VirtualScrollerRangeEvent): void

  /**
   * Emitted when the tail is reached and `lazy` is enabled (не повторяется, пока `loading=true`).
   * @param event
   * @param {VirtualScrollerRangeEvent} payload диапазон `{ first, last }`
   */
  (event: "lazy-load", payload: VirtualScrollerRangeEvent): void
}

/**
 * Methods and states exposed via `ref` for the VirtualScroller component.
 */
export declare type VirtualScrollerExpose = {
  // ---STATE/COMPUTED (resolved options) ---
  /**
   * Включена ли виртуализация (false при `items.length <= threshold`).
   * @type {boolean}
   */
  isVirtual: boolean
  /**
   * Resolved ось виртуализации.
   * @type {VirtualScrollerOrientation}
   */
  orientation: VirtualScrollerOrientation
  /**
   * Resolved режим полосы прокрутки.
   * @type {VirtualScrollerScrollbar}
   */
  scrollbar: VirtualScrollerScrollbar
  /**
   * Resolved overscan-буфер.
   * @type {number}
   */
  overscan: number
  /**
   * Resolved порог авто-включения.
   * @type {number}
   */
  threshold: number
  /**
   * Resolved throttle, мс.
   * @type {number}
   */
  delay: number
  /**
   * Resolved оценка размера элемента.
   * @type {number}
   */
  estimatedItemSize: number
  /**
   * CSS-класс корневого контейнера (вывод `setStyle`; `""` при `unstyled`).
   * @type {StyleClass}
   */
  classBase: StyleClass

  // ---REFS--------------------------------
  /**
   * Template ref на скролл-контейнер (`[data-vs-viewport]`). Для программного доступа к DOM.
   * @type {Ref<HTMLElement | undefined>}
   */
  viewportRef: Ref<HTMLElement | undefined>

  // ---METHODS-----------------------------
  /**
   * Нативный scroll контейнера с заданными опциями.
   * @param {ScrollToOptions} options native ScrollToOptions
   */
  scrollTo(options: ScrollToOptions): void
  /**
   * Прокрутить так, чтобы элемент с индексом стал виден (выравнивание к началу окна).
   * @param {number} index абсолютный индекс
   * @param {ScrollBehavior} [behavior] `"auto"` | `"smooth"`
   */
  scrollToIndex(index: number, behavior?: ScrollBehavior): void
  /**
   * Прокрутить элемент в зону видимости с выбором выравнивания.
   * @param {number} index абсолютный индекс
   * @param {"to-start" | "to-end" | "auto"} [to] выравнивание
   * @param {ScrollBehavior} [behavior] `"auto"` | `"smooth"`
   */
  scrollInView(index: number, to?: "to-start" | "to-end" | "auto", behavior?: ScrollBehavior): void
  /**
   * Текущий отрендеренный диапазон.
   * @returns {VirtualScrollerRangeEvent}
   */
  getRenderedRange(): VirtualScrollerRangeEvent
  /**
   * Сбросить кэш размеров и пересчитать окно (после смены `itemSize`).
   */
  refresh(): void
}

/**
 * Подмножество props, доступное через `componentsOptions.VirtualScroller`.
 */
export declare type VirtualScrollerOption = Pick<
  VirtualScrollerProps,
  | "itemSize"
  | "estimatedItemSize"
  | "orientation"
  | "overscan"
  | "threshold"
  | "delay"
  | "scrollbar"
  | "class"
  | "classContent"
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    VirtualScroller: GlobalComponentConstructor<VirtualScroller>
  }
}

export default VirtualScroller
