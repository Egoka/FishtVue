import { MaybeRef, VNode } from "vue"
import { ClassComponent, ClassesMap, GlobalComponentConstructor, StyleClass } from "../types"
import { IconsProps } from "fishtvue/icons"

/**
 * ## Split
 *
 * Split - a component for creating resizable, adjustable panels.
 *
 * Supports horizontal and vertical layouts, customizable styles, and panel-specific configurations.
 * Works with both mouse and touch screen interactions.
 */
declare class Split extends ClassComponent<SplitProps, SplitSlots, SplitEmits, SplitExpose> {}

// ---------------------------------------
export type CursorType = "center" | "left" | "right"
/** Размер панели (в единицах `units`: проценты или пиксели). Бывший `Size`. */
export type PanelSize = number

/**
 * Ключи карты `classes` (dev-patterns §2 B). `root` — `<div data-split>` (добавляется `ClassesMap`).
 * - `panel` — панель `[data-split-item]` (бывший `styles.panel`).
 * - `separator` — разделитель `[data-split-separator]` и его неактивный близнец
 *   `[data-split-separator-disabled]` (бывший `styles.separator`).
 * - `separatorIcon` — иконка/грип внутри разделителя `[data-split-separator-icon]`.
 * - `overlay` — drag-оверлей `[data-split-drag-overlay]`, перекрывающий viewport во время resize.
 */
export declare type SplitClassKey = "panel" | "separator" | "separatorIcon" | "overlay"

/**
 * Defines a single panel within the Split component.
 */
export type Panel = {
  /**
   * The name of the panel.
   * @type {string}
   */
  name: string

  /**
   * The initial size of the panel.
   * @type {PanelSize | undefined}
   */
  size?: PanelSize

  /**
   * The maximum size of the panel.
   * @type {PanelSize | undefined}
   */
  maxSize?: PanelSize

  /**
   * The minimum size of the panel.
   * @type {PanelSize | undefined}
   */
  minSize?: PanelSize

  /**
   * Disables resizing for the panel.
   * @type {boolean | undefined}
   */
  disabled?: boolean

  /**
   * Hides the panel when set to true.
   * @type {boolean | undefined}
   */
  hidden?: boolean

  /**
   * Custom CSS class for the panel container.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * Any additional properties for the separator item.
   * @type {any}
   */
  [key: string]: any
}

/**
 * Defines a panel group configuration for the Split component.
 */
export type Group = {
  /**
   * The units for panel sizes (`percentages` or `pixels`).
   * @type {"percentages" | "pixels" | undefined}
   */
  units?: "percentages" | "pixels"

  /**
   * The list of panels in the group.
   * Can be passed as a constant value or as a ref.
   * @type {MaybeRef<Array<Panel>>}
   */
  panels: MaybeRef<Panel[]>

  /**
   * Ориентация раскладки панелей. Единое имя с [Menu](./menu.md) и [Separator](./separator.md).
   * Бывший `direction`.
   * @type {"vertical" | "horizontal" | undefined}
   */
  orientation?: "vertical" | "horizontal"
}

/**
 * Props for the Split component.
 */
export declare type SplitProps = {
  /**
   * Persists panel sizes in `localStorage` under the key `fv-split-{autoSaveName}`.
   * Sizes are written on resize end (pointer + keyboard) and restored on mount.
   * The read/write is `isClient()`-guarded, so it is a no-op during SSR.
   * @type {string | undefined}
   */
  autoSaveName?: string

  /**
   * The type of separator used between panels.
   * @type {"strip" | "hexagon" | IconsProps["type"] | undefined}
   */
  separatorType?: "strip" | "hexagon" | IconsProps["type"]

  /**
   * Приглушать разделитель, пока на него не навели курсор. Bare-positive инверсия снятого
   * `separatorNotHoverOpacity` (dev-patterns §2 F): default перевёрнут в `true`.
   * @type {boolean | undefined}
   */
  separatorFade?: boolean

  /**
   * CSS-классы корня `<div data-split>` (dev-patterns §2 A).
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * Карта классов внутренних элементов: `panel`, `separator`, `separatorIcon`, `overlay`;
   * `root` ≡ `class`. См. `SplitClassKey`.
   * @type {ClassesMap<SplitClassKey> | undefined}
   */
  classes?: ClassesMap<SplitClassKey>
} & Group

export declare type SplitSlots = {
  [key: string]: (args: { size: number; panel: Panel }) => VNode[]
}

/**
 * Events emitted by the Split component.
 */
export declare type SplitEmits = {
  /**
   * Emitted when the panel sizes are updated.
   * @param event
   * @param {Record<Panel["name"], number>} panels - The updated sizes of all panels.
   */
  (event: "updated-panels", panels: Record<Panel["name"], number>): void

  /**
   * Emitted when a single panel's size is updated.
   * @param event
   * @param {PanelSize} panel - The updated size of the panel.
   * @param {Panel["name"]} namePanel - The name of the resized panel.
   */
  (event: "updated-size-panel", panel: PanelSize, namePanel: Panel["name"]): void

  /**
   * Emitted when resizing starts for a panel.
   * @param event
   * @param {PointerEvent | undefined} $event - The pointer event triggering the resize.
   * @param {Panel["name"] | undefined} namePanel - The name of the panel being resized.
   */
  (event: "start-resize-panel", $event?: PointerEvent, namePanel?: Panel["name"]): void

  /**
   * Emitted when resizing stops for a panel.
   * @param event
   * @param {PointerEvent | undefined} $event - The pointer event triggering the stop action.
   * @param {Panel["name"] | undefined} namePanel - The name of the panel being resized.
   */
  (event: "stop-resize-panel", $event?: PointerEvent, namePanel?: Panel["name"]): void

  /**
   * Emitted when a panel is actively being resized.
   * @param event
   * @param {PointerEvent} $event - The pointer event during resizing.
   * @param {Panel["name"]} namePanel - The name of the panel being resized.
   */
  (event: "move-resize-panel", $event: PointerEvent, namePanel: Panel["name"]): void

  /**
   * Emitted when the pointer exits the panel boundary during resize.
   * @param event
   * @param {PointerEvent} $event - The pointer event during the action.
   * @param {Panel["name"]} namePanel - The name of the affected panel.
   */
  (event: "out-resize-panel", $event: PointerEvent, namePanel: Panel["name"]): void
}

/**
 * Methods and states exposed via `ref` for the Split component.
 */
export declare type SplitExpose = {
  // ---REF-LINK----------------------------
  /**
   * Reference to the resizable group container element.
   * @type {HTMLElement | undefined}
   */
  resizableGroup: HTMLElement | undefined

  /**
   * References to the individual resizable panel elements.
   * @type {Record<string, HTMLElement>}
   */
  resizablePanels: Record<string, HTMLElement>

  // ---STATE-------------------------------
  /**
   * The current sizes of the panels.
   * @type {Record<Panel["name"], number>}
   */
  sizePanels: Record<Panel["name"], number>

  /**
   * The current cursor type for resizing panels.
   * @type {Record<Panel["name"], CursorType>}
   */
  cursorPanels: Record<Panel["name"], CursorType>

  /**
   * The cursor type currently active during resizing.
   * @type {CursorType}
   */
  activeCursorPanel: CursorType

  // ---PROPS-------------------------
  /**
   * The units used for panel sizes (`percentages` or `pixels`).
   * @type {SplitProps["units"]}
   */
  units: SplitProps["units"]

  /**
   * The configuration for all panels in the Split component.
   * @type {SplitProps["panels"]}
   */
  panels: SplitProps["panels"]

  /**
   * Ориентация раскладки панелей.
   * @type {SplitProps["orientation"]}
   */
  orientation: SplitProps["orientation"]

  /**
   * The type of separator used between panels.
   * @type {SplitProps["separatorType"]}
   */
  separatorType: SplitProps["separatorType"]

  /**
   * Приглушён ли разделитель, пока на него не навели курсор.
   * @type {SplitProps["separatorFade"]}
   */
  separatorFade: SplitProps["separatorFade"]

  /**
   * The base CSS class for the Split component.
   * @type {StyleClass}
   */
  classBase: StyleClass

  // ---METHODS-----------------------------
  /**
   * Moves focus to the first resize handle (separator) of the group.
   * No-op during SSR or before mount.
   * @type {() => void}
   */
  focus: () => void
}
export declare type SplitOption = Pick<SplitProps, "separatorType" | "separatorFade" | "class" | "classes">

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Split: GlobalComponentConstructor<Split>
  }
}

export default Split
