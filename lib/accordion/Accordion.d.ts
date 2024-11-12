import { VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, ReadRef, StyleClass } from "../types"
// ---------------------------------------
export type AccordionItem = {
  title: string
  subtitle?: string
  open?: boolean
  template?: string
  [key: string]: any
}
export declare type AccordionProps = {
  dataSource?: Array<AccordionItem>
  multiple?: boolean
  animationDuration?: number | 100 | 200 | 300 | 500 | 1000 | 3000
  typeIcon?: "ChevronDown" | "ArrowDownCircle" | "Plus" | string
  class?: StyleClass
  classItem?: StyleClass
  classTitle?: StyleClass
  classSubtitle?: StyleClass
}
export declare type AccordionSlots = {
  title(): VNode[]
}
export declare type AccordionEmits = {
  (event: "toggle", payload: AccordionProps["dataSource"]): void
}
export declare type AccordionExpose = {
  // ---STATE-------------------------
  dataItems: ReadRef<AccordionProps["dataSource"]>
  // ---PROPS-------------------------
  multiple: ReadRef<AccordionProps["multiple"]>
  animationDuration: ReadRef<AccordionProps["animationDuration"]>
  typeIcon: ReadRef<AccordionProps["typeIcon"]>
  classBody: ReadRef<AccordionProps["class"]>
  classItem: ReadRef<AccordionProps["classItem"]>
  classTitle: ReadRef<AccordionProps["classTitle"]>
  classSubtitle: ReadRef<AccordionProps["classSubtitle"]>
  // ---METHODS-----------------------
  toggle(key: string | number): void
}
export declare type AccordionOption = Pick<
  AccordionProps,
  "multiple" | "animationDuration" | "typeIcon" | "class" | "classItem" | "classTitle" | "classSubtitle"
>

// ---------------------------------------
declare class Accordion extends ClassComponent<AccordionProps, AccordionSlots, AccordionEmits, AccordionExpose> {}

declare module "vue" {
  export interface GlobalComponents {
    Accordion: GlobalComponentConstructor<Accordion>
  }
}

export default Accordion
