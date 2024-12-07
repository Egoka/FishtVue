import { ClassComponent, GlobalComponentConstructor, ReadRef, StyleClass } from "../types"

/**
 * ## Loading
 *
 * Loading - a component for displaying loading indicators with various styles and animations.
 *
 * Supports multiple loading types, customizable sizes, colors, and animation durations.
 */
declare class Loading extends ClassComponent<LoadingProps, LoadingSlots, LoadingEmits, LoadingExpose> {}

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

/**
 * Props for the Loading component.
 */
export declare type LoadingProps = {
  /**
   * The type of loading animation to display.
   * @type {typesLoading | undefined}
   */
  type?: typesLoading

  /**
   * The duration of the animation in milliseconds.
   * @type {number | 1000 | 1200 | 1500 | 2000 | 2500 | 3000 | 4000 | 5000 | 6000 | undefined}
   */
  animationDuration?: number | 1000 | 1200 | 1500 | 2000 | 2500 | 3000 | 4000 | 5000 | 6000

  /**
   * The size of the loading animation in pixels.
   * @type {number | 40 | 50 | 55 | 60 | 64 | 65 | 66 | 70 | undefined}
   */
  size?: number | 40 | 50 | 55 | 60 | 64 | 65 | 66 | 70

  /**
   * The color of the loading animation.
   * @type {string | undefined}
   */
  color?: string

  /**
   * Custom CSS class for the loading container.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass
}

export declare type LoadingSlots = null

export declare type LoadingEmits = null

/**
 * Methods and states exposed via `ref` for the Loading component.
 */
export declare type LoadingExpose = {
  // ---PROPS-------------------------
  /**
   * The current type of the loading animation.
   * @type {ReadRef<LoadingProps["type"]>}
   */
  type: ReadRef<LoadingProps["type"]>

  /**
   * The current animation duration in milliseconds.
   * @type {ReadRef<LoadingProps["animationDuration"]>}
   */
  animationDuration: ReadRef<LoadingProps["animationDuration"]>

  /**
   * The current size of the loading animation.
   * @type {ReadRef<LoadingProps["size"]>}
   */
  size: ReadRef<LoadingProps["size"]>

  /**
   * The current color of the loading animation.
   * @type {ReadRef<LoadingProps["color"]>}
   */
  color: ReadRef<LoadingProps["color"]>

  /**
   * The current CSS class applied to the loading container.
   * @type {ReadRef<LoadingProps["class"]>}
   */
  classLoading: ReadRef<LoadingProps["class"]>
}
export declare type LoadingOption = Pick<LoadingProps, "animationDuration" | "size" | "color" | "class">

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Loading: GlobalComponentConstructor<Loading>
  }
}

export default Loading
