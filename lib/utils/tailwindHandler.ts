import { twMerge } from "tailwind-merge"
import clsx, { type ClassValue } from "clsx"

/**
 #### `cn` Function Documentation

 The `cn` function is a utility function that combines and merges Tailwind CSS classes using the `clsx` and `twMerge` libraries. It takes any number of class values as arguments and returns a string representing the merged class names.

 ##### Syntax
 ```typescript
 export function cn(...classes: ClassValue[]): string
 ```

 ##### Parameters
 - `classes`: The class values to be merged.

 ##### Return Value
 - A string representing the merged class names.

 ##### Example Usage
 ```typescript
 const result = cn(...classes);
 ```

 The `cn` function can be used to combine and merge Tailwind CSS classes using the `clsx` and `twMerge` libraries. It takes any number of class values as arguments and returns a string representing the merged class names.

 Here is an example of how the `cn` function can be used:

 ```typescript
 import { twMerge } from "tailwind-merge";
 import clsx, { type ClassValue } from "clsx";

 export function cn(...classes: ClassValue[]): string {
 return twMerge(clsx(classes));
 }

 const class1 = "text-red-500";
 const class2 = "bg-blue-500";
 const class3 = "font-bold";

 const mergedClasses = cn(class1, class2, class3);
 console.log(mergedClasses); // "text-red-500 bg-blue-500 font-bold"
 ```

 In this example, the `cn` function is called with three class values: `class1`, `class2`, and `class3`. It merges the class names using `clsx` and `twMerge`, resulting in the string `"text-red-500 bg-blue-500 font-bold"`.
 */
export function cn(...classes: ClassValue[]): string {
  return twMerge(clsx(classes))
}
