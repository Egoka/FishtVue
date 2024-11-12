/**
 #### `isString` Function Documentation

 The `isString` function is a utility function that checks whether a value is a string. It takes two parameters: `value`, which is the value to check, and `empty` (optional), which indicates whether an empty string should be considered as a valid string. It returns a boolean value indicating whether the value is a string.

 ##### Syntax
 ```typescript
 export function isString<T>(value: T, empty = true): boolean
 ```

 ##### Parameters
 - `value`: The value to check.
 - `empty` (optional): Indicates whether an empty string should be considered as a valid string. Default is `true`.

 ##### Return Value
 - A boolean value indicating whether the value is a string.

 ##### Example Usage
 ```typescript
 const isStr = isString(value);
 ```

 The `isString` function can be used to determine whether a value is a string. It checks the type of the value using the `typeof` operator and verifies if it is equal to `"string"`. Additionally, if the `empty` parameter is set to `false`, it checks if the value is an empty string.

 Here is an example of how the `isString` function can be used:

 ```typescript
 const str = "Hello";
 const emptyStr = "";
 console.log(isString(str)); // true
 console.log(isString(emptyStr)); // true
 console.log(isString(123)); // false
 console.log(isString(true)); // false
 console.log(isString(null)); // false
 console.log(isString(undefined)); // false
 ```

 In this example, the `isString` function is called with different values. It returns `true` for the string `"Hello"` and the empty string `""`, indicating that they are valid strings. It returns `false` for other types of values, such as numbers, booleans, `null`, and `undefined`, indicating that they are not strings.

 **Note**: The `isString` function can be used to check whether a value is a string in JavaScript. It is a common utility function used in various programming contexts.
 */
export declare function isString<T>(value: T, empty?: boolean): boolean

/**
 #### `toFlatCase` Function Documentation

 The `toFlatCase` function is a utility function that converts a string from various case styles (such as snake case, kebab case, camel case, and pascal case) to flat case. It takes one parameter: `str`, which is the string to convert. It returns the converted string in flat case.

 ##### Syntax
 ```typescript
 export function toFlatCase(str: string): string
 ```

 ##### Parameters
 - `str`: The string to convert.

 ##### Return Value
 - The converted string in flat case.

 ##### Example Usage
 ```typescript
 const flatStr = toFlatCase(str);
 ```

 The `toFlatCase` function can be used to convert a string from various case styles to flat case. It uses regular expressions to remove any hyphens or underscores and converts the string to lowercase.

 Here is an example of how the `toFlatCase` function can be used:

 ```typescript
 const snakeCaseStr = "hello_world";
 const kebabCaseStr = "hello-world";
 const camelCaseStr = "helloWorld";
 const pascalCaseStr = "HelloWorld";

 console.log(toFlatCase(snakeCaseStr)); // "helloworld"
 console.log(toFlatCase(kebabCaseStr)); // "helloworld"
 console.log(toFlatCase(camelCaseStr)); // "helloworld"
 console.log(toFlatCase(pascalCaseStr)); // "helloworld"
 ```

 In this example, the `toFlatCase` function is called with strings in different case styles. It converts all the strings to flat case by removing any hyphens or underscores and converting them to lowercase.

 **Note**: The `toFlatCase` function can be used to convert strings from various case styles to flat case. It is a useful utility function when working with different naming conventions in programming languages.
 */
export declare function toFlatCase(str: string): string

/**
 #### `toKebabCase` Function Documentation

 The `toKebabCase` function is a utility function that converts a string from various case styles (such as snake case, camel case, and pascal case) to kebab case. It takes one parameter: `str`, which is the string to convert. It returns the converted string in kebab case.

 ##### Syntax
 ```typescript
 export function toKebabCase(str: string): string
 ```

 ##### Parameters
 - `str`: The string to convert.

 ##### Return Value
 - The converted string in kebab case.

 ##### Example Usage
 ```typescript
 const kebabStr = toKebabCase(str);
 ```

 The `toKebabCase` function can be used to convert a string from various case styles to kebab case. It uses regular expressions and string manipulation to replace underscores with hyphens and convert camel case and pascal case to kebab case.

 Here is an example of how the `toKebabCase` function can be used:

 ```typescript
 const snakeCaseStr = "hello_world";
 const camelCaseStr = "helloWorld";
 const pascalCaseStr = "HelloWorld";

 console.log(toKebabCase(snakeCaseStr)); // "hello-world"
 console.log(toKebabCase(camelCaseStr)); // "hello-world"
 console.log(toKebabCase(pascalCaseStr)); // "hello-world"
 ```

 In this example, the `toKebabCase` function is called with strings in different case styles. It converts all the strings to kebab case by replacing underscores with hyphens and inserting hyphens before each uppercase letter (except the first letter) and converting them to lowercase.

 **Note**: The `toKebabCase` function can be used to convert strings from various case styles to kebab case. It is commonly used in web development for creating CSS class names and URLs.
 */
export declare function toCapitalCase(str: string): string

/**
 #### `toCapitalCase` Function Documentation

 The `toCapitalCase` function is a utility function that converts a string to Capital Case format. It takes one parameter: `str`, which is the string to be converted. It returns the converted string in Capital Case format.

 ##### Syntax
 ```typescript
 export function toCapitalCase(str: string): string
 ```

 ##### Parameters
 - `str`: The string to be converted.

 ##### Return Value
 - The converted string in Capital Case format.

 ##### Example Usage
 ```typescript
 const capitalStr = toCapitalCase(str);
 ```

 The `toCapitalCase` function can be used to convert a string to Capital Case format. It checks if the value of the string is a valid string using the `isString` function, and then capitalizes the first letter of the string while leaving the rest of the string unchanged.

 Here is an example of how the `toCapitalCase` function can be used:

 ```typescript
 const lowercaseStr = "hello";
 const uppercaseStr = "WORLD";
 const mixedCaseStr = "HeLLo";

 console.log(toCapitalCase(lowercaseStr)); // "Hello"
 console.log(toCapitalCase(uppercaseStr)); // "WORLD"
 console.log(toCapitalCase(mixedCaseStr)); // "HeLLo"
 ```

 In this example, the `toCapitalCase` function is called with different strings. It capitalizes the first letter of each string while leaving the rest of the string unchanged.

 **Note**: The `toCapitalCase` function can be used to convert strings to Capital Case format. It is a useful utility function when working with different string formats in JavaScript.
 */
export declare function toKebabCase(str: string): string

/**
 #### `stringify` Function Documentation

 The `stringify` function is a utility function that converts a value to a string representation. It takes three parameters: `value`, which is the value to be converted, `indent` (optional), which specifies the number of spaces for indentation, and `currentIndent` (optional), which indicates the current indentation level. It returns the string representation of the value.

 ##### Syntax
 ```typescript
 export function stringify(value: any, indent = 2, currentIndent = 0): string
 ```

 ##### Parameters
 - `value`: The value to be converted.
 - `indent` (optional): The number of spaces for indentation. Default is `2`.
 - `currentIndent` (optional): The current indentation level. Default is `0`.

 ##### Return Value
 - The string representation of the value.

 ##### Example Usage
 ```typescript
 const str = stringify(value);
 ```

 The `stringify` function can be used to convert a value to its string representation. It handles different types of values and applies indentation for nested objects and arrays.

 Here is an example of how the `stringify` function can be used:

 ```typescript
 const obj = {
 name: "John",
 age: 30,
 hobbies: ["reading", "coding"],
 address: {
 street: "123 Main St",
 city: "New York"
 }
 }

 console.log(stringify(obj));
 //{
 //   name: "John",
 //   age: 30,
 //   hobbies: ["reading", "coding"],
 //   address: {
 //     street: "123 Main St",
 //     city: "New York"
 //   }
 // }
 ```

 In this example, the `stringify` function is called with an object. It converts the object to its string representation, including nested objects and arrays.

 **Note**: The `stringify` function is a custom implementation similar to `JSON.stringify`, but with additional support for indentation and handling of different types of values.
 */
export declare function stringify(value: any, indent?: number, currentIndent?: number): string
