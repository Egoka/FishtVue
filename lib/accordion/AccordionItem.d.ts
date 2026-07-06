import { VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor } from "../types"

/**
 * ## AccordionItem
 *
 * AccordionItem — renderless descriptor component for the compound `<Accordion>` API.
 *
 * Не рендерит собственный DOM: родительский [Accordion](./Accordion.d.ts) читает его `props`/`slots`
 * через VNode-walk и сам рендерит секцию. Используется только для декларативной записи:
 *
 * ```vue
 * <Accordion>
 *   <AccordionItem title="Section 1" open>Rich content…</AccordionItem>
 *   <AccordionItem title="Section 2" subtitle="Plain text fallback" />
 * </Accordion>
 * ```
 *
 * Schema-driven `:dataSource` при наличии выигрывает (backward compat). Содержимое секции
 * берётся из default slot; если slot пуст — используется текст `subtitle`.
 */
declare class AccordionItem extends ClassComponent<
  AccordionItemProps,
  AccordionItemSlots,
  AccordionItemEmits,
  AccordionItemExpose
> {}

/**
 * Props for the AccordionItem descriptor component.
 */
export declare type AccordionItemProps = {
  /**
   * The title of the accordion section. Рендерится в заголовке-`<button>`.
   * @type {string | undefined}
   */
  title?: string

  /**
   * Plain-text fallback для содержимого секции, когда default slot пуст.
   * Рендерится как текст; для богатой разметки используйте default slot.
   * @type {string | undefined}
   */
  subtitle?: string

  /**
   * Indicates whether the section is initially open.
   * @type {boolean | undefined}
   */
  open?: boolean
}

/**
 * Slots of the AccordionItem descriptor component.
 */
export declare type AccordionItemSlots = {
  /**
   * Default slot — содержимое секции. Считывается родительским `<Accordion>` через VNode-walk
   * и рендерится внутри панели. Имеет приоритет над текстовым `subtitle`.
   */
  default(): VNode[]
}

/**
 * AccordionItem — renderless descriptor: собственных эмитов не имеет.
 */
export declare type AccordionItemEmits = null

/**
 * AccordionItem is a renderless descriptor — никаких публичных методов/состояния не экспонирует.
 */
export declare type AccordionItemExpose = NonNullable<unknown>

export declare type AccordionItemOption = Pick<AccordionItemProps, "open">

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    AccordionItem: GlobalComponentConstructor<AccordionItem>
  }
}

export default AccordionItem
