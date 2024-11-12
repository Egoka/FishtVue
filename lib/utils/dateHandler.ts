/**
 #### `isDate` Function Documentation

 The `isDate` function is a utility function that checks if an object is a Date object. It takes any value as a parameter and returns a boolean value indicating whether the object is a Date object or not.

 ##### Syntax
 ```typescript
 export function isDate<T>(value: T): boolean
 ```

 ##### Parameters
 - `value`: The object to check if it is a Date object.

 ##### Return Value
 - `true` if the object is an instance of `Date` and its constructor is also `Date`.
 - `false` for all other cases.

 ##### Example Usage
 ```typescript
 const isDate = isDate(value);
 ```

 The `isDate` function can be used to determine if a given object is a Date object. It checks if the object is an instance of the `Date` class and if its constructor is also `Date`.

 Here is an example of how the `isDate` function can be used:

 ```typescript
 const date = new Date();
 const result = isDate(date); // true
 ```

 In this example, the `isDate` function is called with a `Date` object as the parameter, and it returns `true` because the object is indeed a `Date` object.

 It's important to note that the `isDate` function will return `false` for any other type of object, including objects that have a `Date`-like structure but are not actual `Date` objects.
 */
export function isDate<T>(value: T): boolean {
  return value instanceof Date && value.constructor === Date
}
