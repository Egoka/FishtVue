import { ClassComponent, GlobalComponentConstructor, ReadRef, StyleClass } from "../types"
// ---------------------------------------
export declare type IconsProps = {
  type: string
  class?: "h-5 w-5 text-gray-400 dark:text-gray-600" | StyleClass
  style?: string
}
export declare type IconsSlots = null
export declare type IconsEmits = null
export declare type IconsExpose = {
  // ---PROPS-------------------------
  type: ReadRef<IconsProps["type"]>
  classIcon: ReadRef<IconsProps["class"]>
  style: ReadRef<IconsProps["style"]>
  // ---METHODS-----------------------
}
export declare type IconsOption = Pick<IconsProps, "class">

// ---------------------------------------
declare class Icons extends ClassComponent<IconsProps, IconsSlots, IconsEmits, IconsExpose> {}

declare module "vue" {
  export interface GlobalComponents {
    Icons: GlobalComponentConstructor<Icons>
  }
}

export default Icons
