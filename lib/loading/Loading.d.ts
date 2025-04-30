import { ClassComponent, GlobalComponentConstructor, ReadRef, StyleClass } from "../types"

/**
 * ## Loading
 *
 * Loading - a component for displaying loading indicators with various styles and animations.
 *
 * Supports multiple loading types, customizable sizes, colors, and animation durations.
 */
declare class Loading extends ClassComponent<LoadingProps, LoadingSlots, LoadingEmits, LoadingExpose> {}

export type EpicLoading =
  | "AtomSpinner"
  | "BreedingRhombusSpinner"
  | "CirclesToRhombusesSpinner"
  | "FingerprintSpinner"
  | "FlowerSpinner"
  | "FulfillingBouncingCircleSpinner"
  | "FulfillingSquareSpinner"
  | "HalfCircleSpinner"
  | "HollowDotsSpinner"
  | "IntersectingCirclesSpinner"
  | "LoopingRhombusesSpinner"
  | "OrbitSpinner"
  | "PixelSpinner"
  | "RadarSpinner"
  | "ScalingSquaresSpinner"
  | "SelfBuildingSquareSpinner"
  | "SemipolarSpinner"
  | "SpringSpinner"
  | "SwappingSquaresSpinner"
  | "TrinityRingsSpinner"
export type SvgLoading =
  | "simple"
  | "3-dots-bounce"
  | "3-dots-fade"
  | "3-dots-move"
  | "3-dots-rotate"
  | "3-dots-scale"
  | "3-dots-scale-middle"
  | "4-dots-goeey"
  | "4-dots-rotate"
  | "6-dots-rotate"
  | "6-dots-scale"
  | "6-dots-scale-middle"
  | "8-dots-rotate"
  | "8-dots-rotate-scale"
  | "12-dots-scale-rotate"
  | "90-ring"
  | "90-ring-with-bg"
  | "90-ring-with-gradient"
  | "180-ring"
  | "180-ring-with-bg"
  | "270-ring"
  | "270-ring-with-bg"
  | "audio"
  | "ball-triangle"
  | "bars"
  | "bars-fade"
  | "bars-rotate-fade"
  | "bars-scale"
  | "bars-scale-fade"
  | "bars-scale-middle"
  | "blocks-scale"
  | "blocks-shuffle-2"
  | "blocks-shuffle-3"
  | "blocks-shuffle-4"
  | "blocks-shuffle-5"
  | "blocks-wave"
  | "bouncing-ball"
  | "circle-fade"
  | "circles"
  | "clock"
  | "cog01"
  | "cog02"
  | "cog03"
  | "cog04"
  | "cog05"
  | "cog06"
  | "cog07"
  | "cog08"
  | "cog09"
  | "cog10"
  | "cog11"
  | "cog12"
  | "cog13"
  | "cog14"
  | "cog15"
  | "cog16"
  | "cog17"
  | "cog18"
  | "cog19"
  | "cog20"
  | "cog21"
  | "cog22"
  | "cog23"
  | "cog24"
  | "dot-revolve"
  | "eclipse"
  | "eclipse-half"
  | "gooey-balls-1"
  | "gooey-balls-2"
  | "grid"
  | "hearts"
  | "horizontal-bar"
  | "jump"
  | "loader1"
  | "loader2"
  | "loader3"
  | "loader4"
  | "loader5"
  | "loader6"
  | "loader7"
  | "loader8"
  | "loader9"
  | "loader10"
  | "loader-wifi"
  | "oval"
  | "pacman"
  | "puff"
  | "pulse"
  | "pulse2"
  | "pulse-3"
  | "pulse-multiple"
  | "pulse-ring"
  | "pulse-rings-2"
  | "pulse-rings-3"
  | "pulse-rings-multiple"
  | "ring-resize"
  | "rings"
  | "spinner"
  | "spinner-double"
  | "spinner-multiple"
  | "spinning-circles"
  | "tadpole"
  | "tail-spin"
  | "wifi"
  | "wifi-fade"
  | "wind-toy"

/**
 * Props for the Loading component.
 */
export declare type LoadingProps = {
  /**
   * The type of loading animation to display.
   * @type {EpicLoading | SvgLoading | "simple"}
   */
  type?: EpicLoading | SvgLoading | "simple"

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
