export type Position = Record<"name" | "position", string>
export const classDiv = [
  "flex justify-center items-center text-center",
  "size-36 p-2",
  "text-neutral-400 dark:text-neutral-500",
  "rounded-sm border-2 border-neutral-300 dark:border-neutral-700 border-dotted",
  "cursor-pointer select-none",
  "transition-all duration-500"
]
export const classDivActive = [
  "text-neutral-600 dark:text-neutral-300",
  "border-theme-600 dark:border-theme-400 bg-theme-600/20 dark:bg-theme-400/20"
]

export const classWindow = [
  "font-asap tracking-wide font-semibold text-xl",
  "px-2 py-1 rounded-sm bg-neutral-300 dark:bg-neutral-800"
]
