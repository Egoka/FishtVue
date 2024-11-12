/**
 #### `isFunction` Function Documentation

 The `isFunction` function is a utility function that checks whether a given value is of type function. It takes one parameter: `value`, which is the value to be checked. It returns a boolean value indicating whether the value is a function or not.

 ##### Syntax
 ```typescript
 export function isFunction<T>(value: T): boolean
 ```

 ##### Parameters
 - `value`: The value to be checked.

 ##### Return Value
 - `true` if the value is of type function.
 - `false` if the value is not of type function.

 ##### Example Usage
 ```typescript
 const result = isFunction(value);
 ```

 The `isFunction` function can be used to check whether a given value is of type function. It performs several checks on the value to determine if it is a function. These checks include checking the value's constructor, using the `instanceof` operator, and checking if the value has the `apply` method.

 Here is an example of how the `isFunction` function can be used:

 ```typescript
 const func = () => {
 console.log('Hello, world!');
 };

 const result = isFunction(func);
 console.log(result); // true
 ```

 In this example, the `isFunction` function is called with a function `func`. It returns `true`, indicating that the value is of type function.
 */
export function isFunction<T>(value: T): boolean {
  return !!(value && value.constructor === Function && value instanceof Function && value.apply)
}
