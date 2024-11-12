import { ClassComponent, GlobalComponentConstructor, ReadRef, StyleClass } from "../types"
type typesLoading =
  | "simple"
  | "Atom"
  | "BreedingRhombus"
  | "CirclesToRhombuses"
  | "Fingerprint"
  | "Flower"
  | "FulfillingBouncingCircle"
  | "FulfillingSquare"
  | "HalfCircle"
  | "HollowDots"
  | "IntersectingCircles"
  | "LoopingRhombuses"
  | "Orbit"
  | "Pixel"
  | "Radar"
  | "ScalingSquares"
  | "SelfBuildingSquare"
  | "Semipolar"
  | "Spring"
  | "SwappingSquares"
  | "TrinityRings"
// ---------------------------------------
export declare type LoadingProps = {
  type?: typesLoading
  animationDuration?: number | 1000 | 1200 | 1500 | 2000 | 2500 | 3000 | 4000 | 5000 | 6000
  size?: number | 40 | 50 | 55 | 60 | 64 | 65 | 66 | 70
  color?: string
  class?: StyleClass
}
export declare type LoadingSlots = null
export declare type LoadingEmits = null
export declare type LoadingExpose = {
  // ---PROPS-------------------------
  type: ReadRef<LoadingProps["type"]>
  animationDuration: ReadRef<LoadingProps["animationDuration"]>
  size: ReadRef<LoadingProps["size"]>
  color: ReadRef<LoadingProps["color"]>
  classLoading: ReadRef<LoadingProps["class"]>
  // ---METHODS-----------------------
}
export declare type LoadingOption = Pick<LoadingProps, "animationDuration" | "size" | "color" | "class">

// ---------------------------------------
declare class Loading extends ClassComponent<LoadingProps, LoadingSlots, LoadingEmits, LoadingExpose> {}

declare module "vue" {
  export interface GlobalComponents {
    Loading: GlobalComponentConstructor<Loading>
  }
}

export default Loading
