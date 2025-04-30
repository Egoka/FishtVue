import { Locale } from "date-fns"

interface FormatDateOptions {
  locale?: Locale
}
type DateFormatMask =
  | "M"
  | "MM"
  | "MMM"
  | "MMMM"
  | "D"
  | "DD"
  | "Do"
  | "d"
  | "dd"
  | "W"
  | "WW"
  | "WWW"
  | "WWWW"
  | "YY"
  | "YYYY"
  | "h"
  | "hh"
  | "H"
  | "HH"
  | "m"
  | "mm"
  | "s"
  | "ss"
  | "S"
  | "SS"
  | "SSS"
  | "A"
  | "a"
  | "ZZ"
  | "ZZZ"
  | "ZZZZ"
  | "L"
  | "DD MMMM YYYY"
  | "DD.MM.YYYY"
  | "YYYY/MM/DD"
  | string
/**
 #### `isDate` Function Documentation

 The `isDate` function checks if a given value is a valid `Date` object.

 ##### Syntax
 ```typescript
 export function isDate<T>(value: T): boolean
 ```

 ##### Parameters
 - `value`: The value to check.

 ##### Return Value
 - `true` if the value is an instance of `Date` and its constructor is also `Date`.
 - `false` otherwise.

 ##### Example Usage
 ```typescript
 const date = new Date();
 const result = isDate(date); // true
 ```

 The `isDate` function can be used to verify if a given value is a `Date` object. It checks if the value is an instance of the `Date` class and if its constructor is also `Date`.

 Example:
 ```typescript
 const date = new Date();
 const result = isDate(date); // true
 ```

 In this example, the `isDate` function is called with a `Date` object as the parameter, and it returns `true` because the object is indeed a `Date` object.

 It's important to note that the `isDate` function will return `false` for any other type of value, including objects that have a `Date`-like structure but are not actual `Date` objects.
 */
export declare function isDate<T>(value: T): boolean

/**
 #### `convertMask` Function Documentation

 The `convertMask` function converts a date formatting mask from `dayjs` format to `date-fns` format.

 ##### Syntax
 ```typescript
 export function convertMask(dayjsMask: string): string
 ```

 ##### Parameters
 - `dayjsMask`: A `string` representing a date formatting mask in `dayjs` format.

 ##### Return Value
 - Returns a `string` representing the equivalent formatting mask compatible with `date-fns`. If the input mask is not recognized, it is returned as-is.

 ##### Supported Mappings

 | dayjs Mask       | date-fns Equivalent |
 |------------------|---------------------|
 | `M`, `MM`, `MMM`, `MMMM` | Month representations |
 | `D`, `DD`, `Do`          | Day of the month |
 | `d`, `dd`, `WWW`, `WWWW` | Weekday representations |
 | `W`, `WW`                | Week of the year |
 | `YY`, `YYYY`             | Year representations |
 | `h`, `hh`, `H`, `HH`     | Hour (12/24) |
 | `m`, `mm`                | Minutes |
 | `s`, `ss`                | Seconds |
 | `S`, `SS`, `SSS`         | Fractional seconds |
 | `A`, `a`                 | AM/PM |
 | `ZZ`, `ZZZ`, `ZZZZ`      | Timezone |
 | `L`                     | Localized format |
 | `DD MMMM YYYY`, `DD.MM.YYYY`, `YYYY/MM/DD` | Common full formats |

 ##### Example Usage
 ```typescript
 const dateFnsMask = convertMask("DD.MM.YYYY"); // returns "dd.MM.yyyy"
 ```

 This function helps ensure a smooth migration path when transitioning from `dayjs` to `date-fns` by automatically translating formatting masks commonly used in legacy code.

 If the `dayjsMask` is not found in the predefined map, the original string is returned unchanged. This allows for flexibility with custom or extended formats.
 */
export declare function convertMask(dayjsMask: string): string

/**
 * #### `formatDate` Function Documentation
 *
 * The `formatDate` function is a comprehensive date formatting utility that supports multiple input formats
 * and output patterns. It leverages the date-fns library for robust date manipulation and formatting.
 *
 * ##### Syntax
 * ```typescript
 * export function formatDate(
 *   value: string | number | Date,
 *   mask?: DateFormatMask,
 *   options?: FormatDateOptions
 * ): string
 * ```
 *
 * ##### Parameters
 * - `value`: The date to format. Can be:
 *   - A Date object
 *   - ISO string (e.g., "2023-10-13T19:09:01.833Z")
 *   - Short ISO date (e.g., "2023-10-13")
 *   - Localized date string (e.g., "13.10.2023")
 *
 * - `mask` (optional): The formatting pattern. Defaults to "DD.MM.YYYY".
 *   Supports all standard date-fns tokens plus extended patterns:
 *   - Date components: "D", "DD", "Do", "M", "MM", "MMM", "MMMM", "YY", "YYYY"
 *   - Time components: "h", "hh", "H", "HH", "m", "mm", "s", "ss", "S", "SS", "SSS"
 *   - Weekdays: "d", "dd", "W", "WW", "WWW", "WWWW"
 *   - Special formats: "L" (localized), "A"/"a" (AM/PM), timezone tokens
 *   - Predefined combinations: "DD MMMM YYYY", "YYYY/MM/DD" etc.
 *
 * - `options` (optional): Configuration object with:
 *   - `locale`: Explicit locale override (default: auto-detected)
 *
 * ##### Return Value
 * Returns a formatted date string according to the specified pattern.
 * Throws an error for invalid date values.
 *
 * ##### Locale Auto-Detection
 * The function automatically detects locale based on:
 * 1. Presence of language-specific characters in mask (e.g., кириллица → Russian)
 * 2. Common date formats (e.g., "DD.MM.YYYY" → Russian)
 * 3. Defaults to English (enUS) when no clues are present
 *
 * Supported auto-detected locales include:
 * - English (enUS)
 * - Russian (ru)
 * - German (de)
 * - French (fr)
 * - Spanish (es)
 * - And 10+ others via character pattern matching
 *
 * ##### Example Usage
 * ```typescript
 * // Basic formatting
 * formatDate(new Date(), "DD MMMM YYYY") // "13 October 2023"
 *
 * // Localized formatting (auto-detected)
 * formatDate("13.10.2023", "Do MMMM") // "13th October"
 * formatDate("2023-10-13", "DD MMMM", { locale: locales.ru }) // "13 октября"
 *
 * // Time formatting
 * formatDate("2023-10-13T15:30:00", "HH:mm A") // "15:30 PM"
 *
 * // Special formats
 * formatDate(new Date(), "L") // Localized short date
 * formatDate(new Date(), "WWWW") // Full weekday name
 * ```
 *
 * ##### Error Handling
 * Throws clear errors for:
 * - Invalid date values ("Invalid date value")
 * - Unparseable dates ("Invalid date")
 *
 * ##### Implementation Notes
 * 1. Uses date-fns's parse/format functions internally
 * 2. Handles timezone conversion for string inputs
 * 3. Optimized for common use cases while remaining extensible
 * 4. Pure function - doesn't modify input parameters
 */
export function formatDate(value: string | number | Date, mask: DateFormatMask, options: FormatDateOptions): string
