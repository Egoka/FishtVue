/**
 #### `isArray` Function Documentation

 The `isArray` function is a utility function that checks if an object is an array. It takes any value as a parameter and returns a boolean value indicating whether the object is an array or not.

 ##### Syntax
 ```typescript
 export function isArray<T>(value: T, empty = true): boolean
 ```

 ##### Parameters
 - `value`: The object to check if it is an array.
 - `empty` (optional): A boolean value indicating whether to consider an empty array as `true` or `false`. The default value is `true`.

 ##### Return Value
 - `true` if the object is an instance of `Array` and, if `empty` is `true`, the array is not empty (i.e., it has a length greater than 0).
 - `false` for all other cases.

 ##### Example Usage
 ```typescript
 const isArray = isArray(value);
 ```

 The `isArray` function can be used to determine if a given object is an array. It checks if the object is an instance of the `Array` class and, if specified, if the array is not empty.

 Here is an example of how the `isArray` function can be used:

 ```typescript
 const array = [1, 2, 3];
 const result = isArray(array); // true
 ```

 In this example, the `isArray` function is called with an array as the parameter, and it returns `true` because the object is indeed an array.

 By default, the `isArray` function considers an empty array as `true`. However, you can override this behavior by passing `false` as the second parameter:

 ```typescript
 const emptyArray = [];
 const result = isArray(emptyArray, false); // false
 ```

 In this case, the `isArray` function returns `false` because the `emptyArray` is empty and the `empty` parameter is set to `false`.

 It's important to note that the `isArray` function will return `false` for any other type of object, including objects that have a similar structure to an array but are not actual arrays.
 */
export declare function isArray<T>(value: T, empty?: boolean): boolean

/**
 #### `contains` Function Documentation

 The `contains` function is a utility function that checks if a value is present in an array. It takes two parameters: the `value` to search for and the `list` in which to search for the value. It returns a boolean value indicating whether the value is found in the list or not.

 ##### Syntax
 ```typescript
 export function contains<T>(value: T, list: T[]): boolean
 ```

 ##### Parameters
 - `value`: The value to search for in the list.
 - `list`: The array in which to search for the value.

 ##### Return Value
 - `true` if the value is found in the list.
 - `false` if the value is not found in the list or if the list is empty or `null`.

 ##### Example Usage
 ```typescript
 const contains = contains(value, list);
 ```

 The `contains` function can be used to check if a value is present in an array. It iterates over the elements in the list and compares each element to the given value using the `equals` function.

 Here is an example of how the `contains` function can be used:

 ```typescript
 const array = [1, 2, 3, 4, 5];
 const value = 3;
 const result = contains(value, array); // true
 ```

 In this example, the `contains` function is called with the value `3` and the array `[1, 2, 3, 4, 5]`. It returns `true` because the value `3` is present in the array.

 It's important to note that the `contains` function will return `false` if the value is not found in the list or if the list is empty or `null`.
 */
export declare function contains<T>(value: T, list: T[]): boolean

/**
 #### `nestedKeys` Function Documentation

 The `nestedKeys` function is a utility function that retrieves all the nested keys from an object. It takes two parameters: `obj`, which is the object to extract the keys from, and `parentKey` (optional), which is a string representing the parent key of the current object. It returns an array of strings representing the nested keys.

 ##### Syntax
 ```typescript
 export function nestedKeys(obj = {}, parentKey = ""): string[]
 ```

 ##### Parameters
 - `obj` (optional): The object to extract the keys from. If not provided, an empty object is used as the default value.
 - `parentKey` (optional): A string representing the parent key of the current object. If not provided, an empty string is used as the default value.

 ##### Return Value
 - An array of strings representing the nested keys of the object.

 ##### Example Usage
 ```typescript
 const keys = nestedKeys(obj, parentKey);
 ```

 The `nestedKeys` function can be used to retrieve all the nested keys from an object. It recursively iterates over the object and its nested properties, concatenating the keys with a dot notation to represent the nested structure.

 Here is an example of how the `nestedKeys` function can be used:

 ```typescript
 const obj = {
 key1: {
 nestedKey1: "value1",
 nestedKey2: "value2",
 },
 key2: {
 nestedKey3: "value3",
 nestedKey4: "value4",
 },
 };

 const keys = nestedKeys(obj);
 console.log(keys);
 ```

 Output:
 ```
 [
 "key1.nestedKey1",
 "key1.nestedKey2",
 "key2.nestedKey3",
 "key2.nestedKey4",
 ]
 ```

 In this example, the `nestedKeys` function is called with an object that has nested properties. It returns an array of strings representing the nested keys of the object.
 */
export declare function nestedKeys(obj: object, parentKey?: string): string[]

/**
 #### `sort` Function Documentation

 The `sort` function is a utility function that performs sorting on two values based on a provided comparator function. It takes five parameters: `value1` and `value2`, which are the values to be compared, `order` (optional), which specifies the sort order (ascending or descending), `comparator`, which is the function used to compare the values, and `nullSortOrder` (optional), which specifies the sort order when one or both of the values are empty or null. It returns a number indicating the sort order of the values.

 ##### Syntax
 ```typescript
 export function sort(
 value1: any,
 value2: any,
 order = 1,
 comparator: (a: any, b: any) => any,
 nullSortOrder = 1
 ): number
 ```

 ##### Parameters
 - `value1`: The first value to be compared.
 - `value2`: The second value to be compared.
 - `order` (optional): The sort order. The default value is `1` for ascending order.
 - `comparator`: The function used to compare the values.
 - `nullSortOrder` (optional): The sort order when one or both of the values are empty or null. The default value is `1` for ascending order.

 ##### Return Value
 - A number indicating the sort order of the values. If the number is negative, `value1` should be placed before `value2` in the sorted order. If the number is positive, `value1` should be placed after `value2` in the sorted order. If the number is `0`, the order of `value1` and `value2` does not matter.

 ##### Example Usage
 ```typescript
 const result = sort(value1, value2, order, comparator, nullSortOrder);
 ```

 The `sort` function can be used to perform sorting on two values based on a provided comparator function. It compares the values using the `compare` function and applies the specified sort order.

 Here is an example of how the `sort` function can be used:

 ```typescript
 const value1 = 5;
 const value2 = 3;
 const order = 1; // Ascending order
 const comparator = (a, b) => a - b;
 const nullSortOrder = 1; // Ascending order for null values

 const result = sort(value1, value2, order, comparator, nullSortOrder);
 console.log(result); // 2
 ```

 In this example, the `sort` function is called with two values (`value1` and `value2`), an ascending sort order (`order`), a comparator function (`comparator`), and an ascending sort order for null values (`nullSortOrder`). The function compares the values using the provided comparator function and returns `2`, indicating that `value1` should be placed after `value2` in the sorted order.
 */
export declare function sort(
  value1: any,
  value2: any,
  order: number,
  comparator: (a: any, b: any) => any,
  nullSortOrder: number
): number

/**
 #### `filter` Function Documentation

 The `filter` function is a utility function that filters an array based on a filter value and a list of fields. It takes three parameters: `value`, which is the array to be filtered, `fields`, which is an array of fields to search for the filter value, and `filterValue`, which is the value to filter by. It returns a new array containing the filtered items.

 ##### Syntax
 ```typescript
 export function filter<T>(value: T[], fields: T[], filterValue: string): T[]
 ```

 ##### Parameters
 - `value`: The array to be filtered.
 - `fields`: An array of fields to search for the filter value.
 - `filterValue`: The value to filter by.

 ##### Return Value
 - A new array containing the filtered items.

 ##### Example Usage
 ```typescript
 const filteredItems = filter(value, fields, filterValue);
 ```

 The `filter` function can be used to filter an array based on a filter value and a list of fields. It iterates over the `value` array and checks if any of the `fields` contain the `filterValue`. If a match is found, the item is added to the `filteredItems` array.

 Here is an example of how the `filter` function can be used:

 ```typescript
 const value = [
 { name: "John", age: 25 },
 { name: "Jane", age: 30 },
 { name: "Bob", age: 35 },
 ];
 const fields = ["name"];
 const filterValue = "Jo";

 const filteredItems = filter(value, fields, filterValue);
 console.log(filteredItems);
 ```

 Output:
 ```
 [{ name: "John", age: 25 }]
 ```

 In this example, the `filter` function is called with an array of objects (`value`), an array of fields (`fields`), and a filter value (`filterValue`). It returns a new array containing the objects that have a field value matching the filter value.
 */
export declare function filter<T>(value: T[], fields: T[], filterValue: string): T[]

/**
 #### `reorderArray` Function Documentation

 The `reorderArray` function is a utility function that reorders elements in an array based on the specified `from` and `to` indices. It takes three parameters: `value`, which is the array to be reordered, `from`, which is the index of the element to be moved, and `to`, which is the index where the element should be moved to. The function modifies the original array.

 ##### Syntax
 ```typescript
 export function reorderArray<T>(value: T[], from: number, to: number): void
 ```

 ##### Parameters
 - `value`: The array to be reordered.
 - `from`: The index of the element to be moved.
 - `to`: The index where the element should be moved to.

 ##### Return Value
 - This function does not return a value. It modifies the original array in place.

 ##### Example Usage
 ```typescript
 reorderArray(value, from, to);
 ```

 The `reorderArray` function can be used to reorder elements in an array based on the specified `from` and `to` indices. It uses the `splice` method to remove the element at the `from` index and then inserts it at the `to` index.

 Here is an example of how the `reorderArray` function can be used:

 ```typescript
 const array = [1, 2, 3, 4, 5];
 const from = 2;
 const to = 4;

 reorderArray(array, from, to);
 console.log(array);
 ```

 Output:
 ```
 [1, 2, 4, 5, 3]
 ```

 In this example, the `reorderArray` function is called with an array `[1, 2, 3, 4, 5]`, the `from` index `2`, and the `to` index `4`. The element at index `2` (value `3`) is removed from the array and inserted at index `4`, resulting in the reordered array `[1, 2, 4, 5, 3]`.
 */
export declare function reorderArray<T>(value: T[], from: number, to: number): void

/**
 #### `findLast` Function Documentation

 The `findLast` function is a utility function that searches for the last element in an array that satisfies a given condition. It takes two parameters: `arr`, which is the array to search in, and `callback`, which is the function used to determine if an element satisfies the condition. It returns the last element that satisfies the condition, or `undefined` if no such element is found.

 ##### Syntax
 ```typescript
 export function findLast<T>(arr: T[], callback: (value: T, index: number, array: T[]) => unknown): T | undefined
 ```

 ##### Parameters
 - `arr`: The array to search in.
 - `callback`: The function used to determine if an element satisfies the condition.

 ##### Return Value
 - The last element in the array that satisfies the condition.
 - `undefined` if no element satisfies the condition.

 ##### Example Usage
 ```typescript
 const result = findLast(arr, callback);
 ```

 The `findLast` function can be used to search for the last element in an array that satisfies a given condition. It iterates over the array in reverse order and applies the provided callback function to each element. If the callback function returns a truthy value for an element, that element is considered a match and returned as the result.

 Here is an example of how the `findLast` function can be used:

 ```typescript
 const array = [1, 2, 3, 4, 5];
 const callback = () => true;

 const result = findLast(array, callback);
 console.log(result); // 5
 ```

 In this example, the `findLast` function is called with an array `[1, 2, 3, 4, 5]` and a callback function that always returns `true`. It returns `5`, which is the last element in the array.
 */
export declare function findLast<T>(
  value: T[],
  callback: (value: T, index: number, array: T[]) => unknown
): T | undefined

/**
 #### `findLastIndex` Function Documentation

 The `findLastIndex` function is a utility function that searches for the index of the last element in an array that satisfies a given condition. It takes two parameters: `arr`, which is the array to search in, and `callback`, which is the function used to determine if an element satisfies the condition. It returns the index of the last element that satisfies the condition, or `-1` if no such element is found.

 ##### Syntax
 ```typescript
 export function findLastIndex<T>(arr: T[], callback: (value: T, index: number, array: T[]) => unknown): number
 ```

 ##### Parameters
 - `arr`: The array to search in.
 - `callback`: The function used to determine if an element satisfies the condition.

 ##### Return Value
 - The index of the last element in the array that satisfies the condition.
 - `-1` if no element satisfies the condition.

 ##### Example Usage
 ```typescript
 const result = findLastIndex(arr, callback);
 ```

 The `findLastIndex` function can be used to search for the index of the last element in an array that satisfies a given condition. It iterates over the array in reverse order and applies the provided callback function to each element. If the callback function returns a truthy value for an element, the index of that element is considered a match and returned as the result.

 Here is an example of how the `findLastIndex` function can be used:

 ```typescript
 const array = [1, 2, 3, 4, 5];
 const callback = () => true;

 const result = findLastIndex(array, callback);
 console.log(result); // 4
 ```

 In this example, the `findLastIndex` function is called with an array `[1, 2, 3, 4, 5]` and a callback function that always returns `true`. It returns `4`, which is the index of the last element in the array.
 */
export declare function findLastIndex<T>(value: T[], callback: (value: T, index: number, array: T[]) => unknown): number

/**
 #### `findIndexInList` Function Documentation

 The `findIndexInList` function is a utility function that searches for the index of a specific value in an array. It takes two parameters: `value`, which is the value to search for, and `list`, which is the array to search in. It returns the index of the first occurrence of the value in the array, or `-1` if the value is not found.

 ##### Syntax
 ```typescript
 export function findIndexInList<T>(value: T, list: T[]): number
 ```

 ##### Parameters
 - `value`: The value to search for.
 - `list`: The array to search in.

 ##### Return Value
 - The index of the first occurrence of the value in the array.
 - `-1` if the value is not found.

 ##### Example Usage
 ```typescript
 const result = findIndexInList(value, list);
 ```

 The `findIndexInList` function can be used to search for the index of a specific value in an array. It iterates over the array and compares each element to the specified value. If a match is found, the index of the matching element is returned.

 Here is an example of how the `findIndexInList` function can be used:

 ```typescript
 const array = [1, 2, 3, 4, 5];
 const value = 3;

 const result = findIndexInList(value, array);
 console.log(result); // 2
 ```

 In this example, the `findIndexInList` function is called with an array `[1, 2, 3, 4, 5]` and a value `3`. It returns `2`, which is the index of the first occurrence of `3` in the array.
 */
export declare function findIndexInList<T>(value: T, list: T[]): number

/**
 #### `insertIntoOrderedArray` Function Documentation

 The `insertIntoOrderedArray` function is a utility function that inserts an item into an ordered array at the correct position based on a specified index. It takes four parameters: `item`, which is the item to be inserted, `index`, which is the index where the item should be inserted, `arr`, which is the ordered array to insert into, and `sourceArr`, which is the source array used for comparison. The function modifies the original `arr` array.

 ##### Syntax
 ```typescript
 export function insertIntoOrderedArray<T>(item: T, index: number, arr: T[], sourceArr: T[]): void
 ```

 ##### Parameters
 - `item`: The item to be inserted.
 - `index`: The index where the item should be inserted.
 - `arr`: The ordered array to insert into.
 - `sourceArr`: The source array used for comparison.

 ##### Return Value
 - This function does not return a value. It modifies the original `arr` array in place.

 ##### Example Usage
 ```typescript
 insertIntoOrderedArray(item, index, arr, sourceArr);
 ```

 The `insertIntoOrderedArray` function can be used to insert an item into an ordered array at the correct position based on a specified index. It iterates over the `arr` array and compares each element to the `item` using the `findIndexInList` function. If an element in `arr` has an index greater than the specified `index`, the `item` is inserted at that position using the `splice` method. If no such element is found, the `item` is appended to the end of the `arr` array.

 Here is an example of how the `insertIntoOrderedArray` function can be used:

 ```typescript
 const array = [1, 3, 5, 7];
 const item = 4;
 const index = 1;

 insertIntoOrderedArray(item, index, array, array);
 console.log(array); // [1, 3, 4, 5, 7]
 ```

 In this example, the `insertIntoOrderedArray` function is called with an array `[1, 3, 5, 7]`, an item `4`, an index `1`, and the same array `array` as the source array. The `item` is inserted at the correct position based on the specified `index`, resulting in the modified array `[1, 3, 4, 5, 7]`.
 */
export declare function insertIntoOrderedArray<T>(item: T, index: number, arr: T[], sourceArr: T[]): void

/**
 #### `deepCopyArray` Function Documentation

 The `deepCopyArray` function is a utility function that creates a deep copy of an array. It takes one parameter: `array`, which is the array to be copied. It returns a new array that is a deep copy of the original array.

 ##### Syntax
 ```typescript
 export function deepCopyArray<T>(array: T[]): T[]
 ```

 ##### Parameters
 - `array`: The array to be copied.

 ##### Return Value
 - A new array that is a deep copy of the original array.

 ##### Example Usage
 ```typescript
 const newArray = deepCopyArray(array);
 ```

 The `deepCopyArray` function can be used to create a deep copy of an array. It iterates over the elements of the `array` and creates a new array with the same values. If an element in the `array` is itself an array or an object, a deep copy of that element is created recursively.

 Here is an example of how the `deepCopyArray` function can be used:

 ```typescript
 const array = [1, [2, 3], { name: 'John' }];
 const newArray = deepCopyArray(array);
 console.log(newArray); // [1, [2, 3], { name: 'John' }]
 ```

 In this example, the `deepCopyArray` function is called with an array `[1, [2, 3], { name: 'John' }]`. It returns a new array `[1, [2, 3], { name: 'John' }]` that is a deep copy of the original array. Modifying the elements of the new array will not affect the original array.
 */
export declare function deepCopyArray<T>(array: T[]): T[]
