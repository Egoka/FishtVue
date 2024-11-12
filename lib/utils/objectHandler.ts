import { isArray, deepCopyArray } from "fishtvue/utils/arrayHandler"
import { isFunction } from "fishtvue/utils/functionHandler"

/**
 #### `type` Function Documentation

 The `type` function is a utility function that returns the type of an object. It takes one parameter: `obj`, which is the object to determine the type of. It returns a string representing the type of the object.

 ##### Syntax
 ```typescript
 export function type(obj: any): string
 ```

 ##### Parameters
 - `obj`: The object to determine the type of.

 ##### Return Value
 - A string representing the type of the object.

 ##### Example Usage
 ```typescript
 const objType = type(obj);
 ```

 The `type` function can be used to determine the type of an object. It uses the `Object.prototype.toString` method to get the type of the object. The returned type is in lowercase.

 Here is an example of how the `type` function can be used:

 ```typescript
 const obj = [1, 2, 3];
 const objType = type(obj);
 console.log(objType); // "array"
 ```

 In this example, the `type` function is called with an array `[1, 2, 3]`. It returns the string `"array"`, indicating that the type of the object is an array.

 **Note**: The `type` function is not limited to arrays and can be used with any object to determine its type.
 */
export function type(obj: any): string {
  // @ts-ignore
  return Object.prototype.toString
    .call(obj)
    .match(/\s(\w+)/i)[1]
    .toLowerCase()
}

/**
 #### `isObject` Function Documentation

 The `isObject` function is a utility function that checks if a value is an object. It takes two parameters: `value`, which is the value to be checked, and `empty` (optional), which determines if an empty object should be considered as an object. It returns a boolean value indicating whether the value is an object.

 ##### Syntax
 ```typescript
 export function isObject<T>(value: T, empty = true): boolean
 ```

 ##### Parameters
 - `value`: The value to be checked.
 - `empty` (optional): Determines if an empty object should be considered as an object. Default value is `true`.

 ##### Return Value
 - A boolean value indicating whether the value is an object.

 ##### Example Usage
 ```typescript
 const isObj = isObject(value);
 ```

 The `isObject` function can be used to check if a value is an object. It uses the `instanceof` operator and the `Object.prototype.constructor` property to determine if the value is an object. It also checks if the value is an empty object based on the `empty` parameter.

 Here is an example of how the `isObject` function can be used:

 ```typescript
 const obj = { name: 'John', age: 25 };
 const isArrayObj = isObject(obj); // true

 const emptyObj = {};
 const isEmptyObj = isObject(emptyObj); // true

 const num = 10;
 const isNumObj = isObject(num); // false
 ```

 In this example, the `isObject` function is called with different values. It returns `true` for objects (`obj` and `emptyObj`) and `false` for a number (`num`).
 */
export function isObject<T>(value: T, empty = true) {
  return value instanceof Object && value.constructor === Object && (empty || Object.keys(value).length !== 0)
}

/**
 #### `isEmpty` Function Documentation

 The `isEmpty` function is a utility function that checks if a value is empty. It takes one parameter: `value`, which is the value to be checked. It returns a boolean value indicating whether the value is empty.

 ##### Syntax
 ```typescript
 export function isEmpty<T>(value: T): boolean
 ```

 ##### Parameters
 - `value`: The value to be checked.

 ##### Return Value
 - A boolean value indicating whether the value is empty.

 ##### Example Usage
 ```typescript
 const empty = isEmpty(value);
 ```

 The `isEmpty` function can be used to check if a value is empty. It checks for various conditions to determine if the value is empty, including `null`, `undefined`, an empty string, an empty array, and an empty object.

 Here is an example of how the `isEmpty` function can be used:

 ```typescript
 const obj = { name: 'John', age: 25 };
 const isEmptyObj = isEmpty(obj); // false

 const emptyArray = [];
 const isEmptyArray = isEmpty(emptyArray); // true

 const str = '';
 const isEmptyString = isEmpty(str); // true
 ```

 In this example, the `isEmpty` function is called with different values. It returns `false` for a non-empty object (`obj`), `true` for an empty array (`emptyArray`), and `true` for an empty string (`str`).

 **Note**: The `isEmpty` function can be used with various types of values to check if they are empty.
 */
export function isEmpty<T>(value: T) {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "object" &&
      !(value instanceof Date) &&
      !(value instanceof RegExp) &&
      Object.keys(value).length === 0)
  )
}

export function isNotEmpty<T>(value: T) {
  return !isEmpty(value)
}

/**
 #### `get` Function Documentation

 The `get` function is a utility function that retrieves a value from an object based on a given path. It takes two parameters: `obj`, which is the object to retrieve the value from, and `path`, which is the path to the desired value. It returns the value if found, or `undefined` if not found.

 ##### Syntax
 ```typescript
 export function get<T>(obj: T, path: string | string[], separator: string): T | undefined
 ```

 ##### Parameters
 - `obj`: The object to retrieve the value from.
 - `path`: The path to the desired value. It can be a string or an array of strings.

 ##### Return Value
 - The value retrieved from the object, or `undefined` if not found.

 ##### Example Usage
 ```typescript
 const value = get(obj, path);
 ```

 The `get` function can be used to retrieve a value from an object based on a given path. It supports both dot notation and array notation for nested properties.

 Here is an example of how the `get` function can be used:

 ```typescript
 const obj = {
 user: {
 name: 'John',
 age: 25
 }
 };

 const name = get(obj, 'user.name');
 console.log(name); // "John"

 const age = get(obj, ['user', 'age']);
 console.log(age); // 25
 ```

 In this example, the `get` function is called with an object `obj` and a path `'user.name'` and `['user', 'age']`. It retrieves the value `'John'` for the path `'user.name'` and the value `25` for the path `['user', 'age']`.

 **Note**: The `get` function can be used to retrieve values from nested objects using a path.
 */
export function get<T>(obj: T, path: number | string | string[], separator = "."): T | undefined {
  if (typeof path === "string") {
    path = path.replace(/\[(\w+)\]/g, `${separator}$1`) // Преобразование array notation в dot notation
    path = path.split(separator) // Разделение строки пути на массив
  }
  if (typeof path === "number") {
    // @ts-ignore
    return obj[path]
  }
  if (!path || path.length === 0) {
    return undefined
  }
  return path.reduce((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      // @ts-ignore
      return acc[key]
    }
    return undefined
  }, obj)
}

/**
 #### `fieldsOmit` Function Documentation

 The `fieldsOmit` function is a utility function that creates a new object by omitting specified fields from an existing object. It takes two parameters: `structure`, which is the object from which fields will be omitted, and `omitFields`, which is an array of field names to be omitted. It returns a new object that contains all the fields from the original object except for the omitted fields.

 ##### Syntax
 ```typescript
 export function fieldsOmit<Structure extends Record<string, any>>(
 structure: Structure,
 omitFields: Array<keyof Structure>
 ): Omit<Structure, Array<keyof Structure>[number]>
 ```

 ##### Parameters
 - `structure`: The object from which fields will be omitted.
 - `omitFields`: An array of field names to be omitted.

 ##### Return Value
 - A new object that contains all the fields from the original object except for the omitted fields.

 ##### Example Usage
 ```typescript
 const newObj = fieldsOmit(structure, omitFields);
 ```

 The `fieldsOmit` function can be used to create a new object by omitting specified fields from an existing object. It uses the `Object.keys` method and the `reduce` method to iterate over the fields of the original object and create a new object with the desired fields omitted.

 Here is an example of how the `fieldsOmit` function can be used:

 ```typescript
 const obj = {
 name: 'John',
 age: 25,
 city: 'New York'
 };

 const omitFields = ['age', 'city'];
 const newObj = fieldsOmit(obj, omitFields);
 console.log(newObj); // { name: 'John' }
 ```

 In this example, the `fieldsOmit` function is called with an object `obj` and an array of omit fields `['age', 'city']`. It creates a new object `newObj` that contains only the `name` field from the original object.

 **Note**: The `fieldsOmit` function can be used to create a new object with specified fields omitted from the original object.
 */
export function fieldsOmit<Structure extends Record<string | number, any>>(
  structure: Structure,
  omitFields: Array<keyof Structure | string>
): Omit<Structure, Array<keyof Structure>[number]> {
  return Object.keys(structure).reduce((acc, key) => {
    if (!omitFields.some((field) => field == key || (typeof field === "string" && field?.startsWith(`${key}.`)))) {
      ;(acc as any)[key] = structure[key]
    } else {
      const nestedFields = omitFields
        .filter((field) => typeof field === "string" && field.startsWith(`${key}.`))
        .map<string>((field) => (field as string).slice(key.length + 1))
      if (nestedFields.length > 0) {
        ;(acc as any)[key] = fieldsOmit(structure[key], nestedFields)
      }
    }
    return acc
  }, {} as Structure) as unknown as Pick<Structure, Array<keyof Structure>[number]>
}

/**
 #### `fieldsPick` Function Documentation

 The `fieldsPick` function is a utility function that creates a new object by picking specified fields from an existing object. It takes two parameters: `structure`, which is the object from which fields will be picked, and `pickFields`, which is an array of field names to be picked. It returns a new object that contains only the specified fields from the original object.

 ##### Syntax
 ```typescript
 export function fieldsPick<Structure extends Record<string, any>>(
 structure: Structure,
 pickFields: Array<keyof Structure>
 ): Pick<Structure, Array<keyof Structure>[number]>
 ```

 ##### Parameters
 - `structure`: The object from which fields will be picked.
 - `pickFields`: An array of field names to be picked.

 ##### Return Value
 - A new object that contains only the specified fields from the original object.

 ##### Example Usage
 ```typescript
 const newObj = fieldsPick(structure, pickFields);
 ```

 The `fieldsPick` function can be used to create a new object by picking specified fields from an existing object. It uses the `Object.keys` method and the `reduce` method to iterate over the fields of the original object and create a new object with only the desired fields.

 Here is an example of how the `fieldsPick` function can be used:

 ```typescript
 const obj = {
 name: 'John',
 age: 25,
 city: 'New York'
 };

 const pickFields = ['name', 'age'];
 const newObj = fieldsPick(obj, pickFields);
 console.log(newObj); // { name: 'John', age: 25 }
 ```

 In this example, the `fieldsPick` function is called with an object `obj` and an array of pick fields `['name', 'age']`. It creates a new object `newObj` that contains only the `name` and `age` fields from the original object.

 **Note**: The `fieldsPick` function can be used to create a new object with only specified fields picked from the original object.
 */
export function fieldsPick<Structure extends Record<string | number, any>>(
  structure: Structure,
  pickFields: Array<keyof Structure | string>
): Pick<Structure, Array<keyof Structure>[number]> {
  return pickFields?.reduce((acc, field) => {
    const value = get(structure, field as any)
    if (value !== undefined) {
      const path = `${field as any}`.split(".")
      let current = acc
      for (let i = 0; i < path.length - 1; i++) {
        // @ts-ignore
        if (!current[path[i]]) current[path[i]] = {}
        current = current[path[i]]
      }
      // @ts-ignore
      current[path[path.length - 1]] = value
    }
    return acc
  }, {} as Structure) as unknown as Pick<Structure, Array<keyof Structure>[number]>
  // return Object.keys(structure).reduce((acc: Structure, key) => {
  //   if (!pickFields.some((field) => field != key || (typeof field === "string" && field?.startsWith(`${key}.`)))) {
  //     acc[key] = structure[key]
  //   } else {
  //     const nestedFields = pickFields
  //       .filter((field) => !(typeof field === "string" && field.startsWith(`${key}.`)))
  //       .map((field: string) => field.slice(key.length + 1))
  //     if (nestedFields.length > 0) {
  //       acc[key] = fieldsOmit(structure[key], nestedFields)
  //     }
  //   }
  //   return acc
  // }, {}) as Partial<Structure>
}

/**
 #### `deepMerge` Function Documentation

 The `deepMerge` function is a utility function that performs a deep merge of multiple objects. It takes any number of objects as arguments and returns a new object that is the result of merging all the passed objects.

 ##### Syntax
 ```typescript
 export function deepMerge(...objects: any[]): object
 ```

 ##### Parameters
 - `objects`: The objects to be merged.

 ##### Return Value
 - A new object that is the result of the deep merge of all the passed objects.

 ##### Example Usage
 ```typescript
 const mergedObj = deepMerge(obj1, obj2, obj3);
 ```

 The `deepMerge` function can be used to perform a deep merge of multiple objects. It uses the `reduce` method to iterate over the passed objects and merge their properties.

 Here is an example of how the `deepMerge` function can be used:

 ```typescript
 const obj1 = { a: 1, b: { c: 2 } };
 const obj2 = { b: { d: 3 }, e: 4 };
 const obj3 = { f: 5 };

 const mergedObj = deepMerge(obj1, obj2, obj3);
 console.log(mergedObj);
 ```

 In this example, the `deepMerge` function is called with the objects `obj1`, `obj2`, and `obj3`. It creates a new object `mergedObj` that contains all the properties from all the passed objects, taking into account the deep merge.

 **Note**: The `deepMerge` function can be used to perform a deep merge of multiple objects.
 */
export function deepMerge(...objects: any[]): object {
  return objects.reduce((prev: Record<string, any>, obj: Record<string, any>) => {
    if (obj && Object.keys(obj)?.length)
      Object.keys(obj).forEach((key) => {
        const pVal = prev[key]
        const oVal = obj[key]

        if (Array.isArray(pVal) && Array.isArray(oVal)) {
          prev[key] = pVal.concat(...oVal)
        } else if (isObject(pVal) && isObject(oVal)) {
          prev[key] = deepMerge(pVal, oVal)
        } else {
          prev[key] = oVal
        }
      })
    return prev
  }, {})
}

/**
 #### `deepEquals` Function Documentation

 The `deepEquals` function is a utility function that compares two objects deeply to determine if they are equal. It takes two parameters: `a` and `b`, which are the objects to be compared. It returns a boolean value indicating whether the objects are equal.

 ##### Syntax
 ```typescript
 export function deepEquals<A, B>(a: A, b: B): boolean
 ```

 ##### Parameters
 - `a`: The first object to be compared.
 - `b`: The second object to be compared.

 ##### Return Value
 - A boolean value indicating whether the objects are equal. `true` if they are equal, `false` otherwise.

 ##### Example Usage
 ```typescript
 const isEqual = deepEquals(obj1, obj2);
 ```

 The `deepEquals` function can be used to compare two objects deeply. It checks if the objects are equal by comparing their properties recursively. It handles various types of objects, including arrays, dates, regular expressions, and nested objects.

 Here is an example of how the `deepEquals` function can be used:

 ```typescript
 const obj1 = { name: 'John', age: 30 };
 const obj2 = { name: 'John', age: 30 };
 const isEqual = deepEquals(obj1, obj2);
 console.log(isEqual); // true
 ```

 In this example, the `deepEquals` function is called with two objects `obj1` and `obj2` that have the same properties and values. It returns `true`, indicating that the objects are equal.

 **Note**: The `deepEquals` function can handle various types of objects and is not limited to the example shown above.
 */
export function deepEquals<A, B>(a: A, b: B): boolean {
  if ((a as any) === (b as any)) return true

  if (a && b && typeof a == "object" && typeof b == "object") {
    const arrA = Array.isArray(a),
      arrB = Array.isArray(b)
    let i, length, key

    if (arrA && arrB) {
      length = a.length
      if (length != b.length) return false
      for (i = length; i-- !== 0; ) if (!deepEquals(a[i], b[i])) return false

      return true
    }

    if (arrA != arrB) return false

    const dateA = a instanceof Date
    const dateB = b instanceof Date

    if (dateA != dateB) return false
    if (dateA && dateB) return a.getTime() == b.getTime()

    const regexpA = a instanceof RegExp
    const regexpB = b instanceof RegExp

    if (regexpA != regexpB) return false
    if (regexpA && regexpB) return a.toString() == b.toString()

    const keys = Object.keys(a)
    length = keys.length
    if (length !== Object.keys(b).length) return false
    for (i = length; i-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false
    for (i = length; i-- !== 0; ) {
      key = keys[i]
      if (!deepEquals((a as Record<string, any>)[key], (b as Record<string, any>)[key])) return false
    }
    return true
  }
  return a !== a && b !== b
}

/**
 #### `resolveFieldData` Function Documentation

 The `resolveFieldData` function is a utility function that resolves the value of a field in an object. It takes two parameters: `data` and `field`. The `data` parameter represents the object from which to retrieve the field value, and the `field` parameter represents the field name or a function that returns the field value. It returns the resolved field value or `null` if the field cannot be resolved.

 ##### Syntax
 ```typescript
 export function resolveFieldData(data: any, field: any): any | null
 ```

 ##### Parameters
 - `data`: The object from which to retrieve the field value.
 - `field`: The field name or a function that returns the field value.

 ##### Return Value
 - The resolved field value or `null` if the field cannot be resolved.

 ##### Example Usage
 ```typescript
 const resolvedValue = resolveFieldData(data, field);
 ```

 The `resolveFieldData` function can be used to retrieve the value of a field from an object. It handles various scenarios, including checking if the field exists in the object, handling nested fields separated by periods, and resolving the field value using a function.

 Here is an example of how the `resolveFieldData` function can be used:

 ```typescript
 const data = { name: 'John', age: 30 };
 const field = 'name';
 const resolvedValue = resolveFieldData(data, field);
 console.log(resolvedValue); // "John"
 ```

 In this example, the `resolveFieldData` function is called with an object `data` and a field name `'name'`. It retrieves the value of the `'name'` field from the `data` object and returns `"John"`.

 **Note**: The `resolveFieldData` function can handle various scenarios and is not limited to the example shown above.
 */
export function resolveFieldData(data: any, field: any): any | null | undefined {
  if (!data || !field) return null
  if (field in data && isNotEmpty(data[field])) return data[field]
  if (Object.keys(data).length) {
    if (isFunction(field)) {
      return field(data)
    } else if (field.indexOf(".") === -1) {
      return data?.[field]
    } else {
      const fields = field.split(".")
      let value = data

      for (let i = 0, len = fields.length; i < len; ++i) {
        if (value == null) return null
        value = value[fields[i]]
      }
      return value
    }
  }
  return null
}

/**
 #### `equals` Function Documentation

 The `equals` function is a utility function that compares two objects for equality. It takes two parameters: `obj1` and `obj2`, which are the objects to be compared. It also accepts an optional `field` parameter, which represents a specific field to compare. If the `field` parameter is provided, the function compares the values of that field in the two objects. If the `field` parameter is not provided, the function performs a deep comparison of the two objects using the `deepEquals` function. It returns a boolean value indicating whether the objects are equal.

 ##### Syntax
 ```typescript
 export function equals<A, B>(obj1: A, obj2: B, field?: string): boolean
 ```

 ##### Parameters
 - `obj1`: The first object to be compared.
 - `obj2`: The second object to be compared.
 - `field` (optional): The specific field to compare in the objects.

 ##### Return Value
 - A boolean value indicating whether the objects are equal. `true` if they are equal, `false` otherwise.

 ##### Example Usage
 ```typescript
 const isEqual = equals(obj1, obj2, field);
 ```

 The `equals` function can be used to compare two objects for equality. It provides flexibility by allowing you to compare specific fields or perform a deep comparison of the entire objects.

 Here is an example of how the `equals` function can be used:

 ```typescript
 const obj1 = { name: 'John', age: 30 };
 const obj2 = { name: 'John', age: 30 };
 const isEqual = equals(obj1, obj2);
 console.log(isEqual); // true
 ```

 In this example, the `equals` function is called with two objects `obj1` and `obj2` that have the same properties and values. It returns `true`, indicating that the objects are equal.

 Another example using the `field` parameter:

 ```typescript
 const obj1 = { name: 'John', age: 30 };
 const obj2 = { name: 'John', age: 25 };
 const isEqual = equals(obj1, obj2, 'age');
 console.log(isEqual); // false
 ```

 In this example, the `equals` function is called with two objects `obj1` and `obj2`, and the field `'age'`. It compares the values of the `'age'` field in the two objects and returns `false`, indicating that the values are not equal.

 **Note**: The `equals` function provides flexibility in comparing objects and is not limited to the examples shown above.
 */
export function equals<A, B>(obj1: A, obj2: B, field?: string): boolean {
  if (field) return resolveFieldData(obj1, field) === resolveFieldData(obj2, field)
  else return deepEquals(obj1, obj2)
}

/**
 #### `compare` Function Documentation

 The `compare` function is a utility function that compares two values using a comparator function. It takes three parameters: `value1`, `value2`, and `comparator`. The `value1` and `value2` parameters represent the values to be compared, and the `comparator` parameter is a function that defines the comparison logic. The function also accepts an optional `order` parameter, which determines the order of the comparison result. It returns a number indicating the result of the comparison.

 ##### Syntax
 ```typescript
 export function compare<A, B>(value1: A, value2: B, comparator: (a: A, b: B) => any, order = 1): number
 ```

 ##### Parameters
 - `value1`: The first value to be compared.
 - `value2`: The second value to be compared.
 - `comparator`: The comparator function that defines the comparison logic.
 - `order` (optional): The order of the comparison result. Default is `1`.

 ##### Return Value
 - A number indicating the result of the comparison.
 - If `value1` is less than `value2`, it returns a negative number.
 - If `value1` is greater than `value2`, it returns a positive number.
 - If `value1` is equal to `value2`, it returns `0`.

 ##### Example Usage
 ```typescript
 const result = compare(value1, value2, comparator, order);
 ```

 The `compare` function can be used to compare two values using a custom comparator function. It provides flexibility in defining the comparison logic and allows for specifying the order of the comparison result.

 Here is an example of how the `compare` function can be used:

 ```typescript
 const value1 = 5;
 const value2 = 10;
 const comparator = (a, b) => a - b;
 const result = compare(value1, value2, comparator);
 console.log(result); // -5
 ```

 In this example, the `compare` function is called with two values `value1` and `value2`, a comparator function that subtracts `value2` from `value1`, and the default order of `1`. It performs the comparison using the provided comparator function and returns `-5`, indicating that `value1` is less than `value2`.

 **Note**: The `compare` function provides flexibility in comparing values using a custom comparator function and is not limited to the example shown above.
 */
export function compare<A, B>(value1: A, value2: B, comparator: (a: A, b: B) => any, order = 1): number {
  let result
  const emptyValue1 = isEmpty(value1)
  const emptyValue2 = isEmpty(value2)
  if (emptyValue1 && emptyValue2) result = 0
  else if (emptyValue1) result = order
  else if (emptyValue2) result = -order
  else if (typeof value1 === "string" && typeof value2 === "string") result = comparator(value1, value2)
  else result = (value1 as any) < (value2 as any) ? -1 : (value1 as any) > (value2 as any) ? 1 : 0
  return result
}

/**
 #### `deepCopyObject` Function Documentation

 The `deepCopyObject` function is a utility function that creates a deep copy of an object. It takes one parameter: `object`, which is the object to be copied. It returns a new object that is a deep copy of the original object.

 ##### Syntax
 ```typescript
 export function deepCopyObject<T>(object: T): T
 ```

 ##### Parameters
 - `object`: The object to be copied.

 ##### Return Value
 - A new object that is a deep copy of the original object.

 ##### Example Usage
 ```typescript
 const copiedObject = deepCopyObject(object);
 ```

 The `deepCopyObject` function can be used to create a deep copy of an object. It recursively copies all properties and nested objects of the original object to create a new object with the same structure and values.

 Here is an example of how the `deepCopyObject` function can be used:

 ```typescript
 const object = { name: 'John', age: 30 };
 const copiedObject = deepCopyObject(object);
 console.log(copiedObject); // { name: 'John', age: 30 }
 ```

 In this example, the `deepCopyObject` function is called with an object `object`. It creates a deep copy of the `object` and assigns it to the `copiedObject` variable. The `copiedObject` has the same properties and values as the original `object`.

 **Note**: The `deepCopyObject` function creates a deep copy of an object and is not limited to the example shown above.
 */
export function deepCopyObject<T>(object: T): T {
  const result = {} as T
  for (const key in object) {
    const item = object[key]
    if (isArray(item)) {
      result[key] = deepCopyArray(item as any[]) as any
    } else if (item != null && item.constructor == Object) {
      result[key] = deepCopy(item)
    } else {
      result[key] = item
    }
  }
  return result
}

/**
 #### `deepCopy` Function Documentation

 The `deepCopy` function is a utility function that creates a deep copy of a value. It takes one parameter: `value`, which is the value to be copied. It returns a new value that is a deep copy of the original value.

 ##### Syntax
 ```typescript
 export function deepCopy<T>(value: T): T
 ```

 ##### Parameters
 - `value`: The value to be copied.

 ##### Return Value
 - A new value that is a deep copy of the original value.

 ##### Example Usage
 ```typescript
 const copiedValue = deepCopy(value);
 ```

 The `deepCopy` function can be used to create a deep copy of a value. It handles various scenarios, including arrays, objects, and other types of values.

 Here is an example of how the `deepCopy` function can be used:

 ```typescript
 const value = { name: 'John', age: 30 };
 const copiedValue = deepCopy(value);
 console.log(copiedValue); // { name: 'John', age: 30 }
 ```

 In this example, the `deepCopy` function is called with an object `value`. It creates a deep copy of the `value` and assigns it to the `copiedValue` variable. The `copiedValue` has the same properties and values as the original `value`.

 **Note**: The `deepCopy` function can handle various scenarios and is not limited to the example shown above.
 */
export function deepCopy<T>(value: T): T {
  if (isArray(value)) {
    return deepCopyArray(value as unknown[]) as T
  }
  if (value == null) {
    return value
  }
  if (value.constructor == Object) {
    return deepCopyObject(value)
  }
  return value
}

/**
 #### `deepFreeze` Function Documentation

 The `deepFreeze` function is a utility function that recursively freezes an object and its nested objects, making them immutable. It takes one parameter: `obj`, which is the object to be deep frozen. It returns the deep frozen object.

 ##### Syntax
 ```typescript
 export function deepFreeze<T>(obj: T): T
 ```

 ##### Parameters
 - `obj`: The object to be deep frozen.

 ##### Return Value
 - The deep frozen object.

 ##### Example Usage
 ```typescript
 const deepFrozenObject = deepFreeze(obj);
 ```

 The `deepFreeze` function can be used to make an object and its nested objects immutable by freezing them. This prevents any modifications to the object and its properties.

 Here is an example of how the `deepFreeze` function can be used:

 ```typescript
 const obj = { name: 'John', age: 30, address: { city: 'New York', country: 'USA' } };
 const deepFrozenObject = deepFreeze(obj);
 console.log(Object.isFrozen(deepFrozenObject)); // true
 console.log(Object.isFrozen(deepFrozenObject.address)); // true
 ```

 In this example, the `deepFreeze` function is called with an object `obj` that has a nested object `address`. The `deepFreeze` function recursively freezes the `obj` and its nested objects, making them immutable. The `deepFrozenObject` and its `address` property are both deep frozen.

 **Note**: The `deepFreeze` function recursively freezes an object and its nested objects, making them immutable. It is not limited to the example shown above.
 */
export function deepFreeze<T>(obj: T): T {
  if (!obj) return obj
  const propNames = Object.getOwnPropertyNames(obj)

  for (const name of propNames) {
    const value = obj[name as keyof typeof obj]

    if (value && typeof value === "object") {
      deepFreeze(value as Record<string, unknown>)
    }
  }

  return Object.freeze(obj)
}

/**
 #### `freeze` Function Documentation

 The `freeze` function is a utility function that freezes an object to prevent any further modifications to its properties. It takes one parameter: `obj`, which is the object to freeze. It returns the same object after freezing it.

 ##### Syntax
 ```typescript
 export function freeze<T>(obj: T): T
 ```

 ##### Parameters
 - `obj`: The object to freeze.

 ##### Return Value
 - The same object after freezing it.

 ##### Example Usage
 ```typescript
 const frozenObj = freeze(obj);
 ```

 The `freeze` function can be used to freeze an object and make it immutable. It uses the `Object.freeze` method to freeze the object.

 Here is an example of how the `freeze` function can be used:

 ```typescript
 const obj = { name: 'John', age: 30 };
 const frozenObj = freeze(obj);
 console.log(Object.isFrozen(frozenObj)); // true
 ```

 In this example, the `freeze` function is called with an object `{ name: 'John', age: 30 }`. It freezes the object using `Object.freeze` and returns the same object. The `Object.isFrozen` method is then used to check if the object is frozen, and it returns `true`.

 **Note**: The `freeze` function can be used with any object to make it immutable and prevent further modifications.
 */
export function freeze<T>(obj: T): T {
  if (!Object.isFrozen(obj)) {
    Object.freeze(obj)
  }
  return obj
}

/**
 #### `unFreeze` Function Documentation

 The `unFreeze` function is a utility function that unfreezes a previously frozen object, allowing modifications to its properties. It takes one parameter: `obj`, which is the object to unfreeze. It returns the same object after unfreezing it, or the original object if it was not frozen.

 ##### Syntax
 ```typescript
 export function unFreeze<T>(obj: T): T
 ```

 ##### Parameters
 - `obj`: The object to unfreeze.

 ##### Return Value
 - The same object after unfreezing it, or the original object if it was not frozen.

 ##### Example Usage
 ```typescript
 const unfrozenObj = unFreeze(obj);
 ```

 The `unFreeze` function can be used to unfreeze a previously frozen object and allow modifications to its properties. It checks if the object is frozen using the `Object.isFrozen` method. If the object is not frozen, it returns the same object without any modifications. If the object is frozen, it uses a deep copy function, such as `deepCopyObject`, to create a new unfrozen object with the same properties.

 Here is an example of how the `unFreeze` function can be used:

 ```typescript
 const obj = { name: 'John', age: 30 };
 Object.freeze(obj);
 const unfrozenObj = unFreeze(obj);
 unfrozenObj.name = 'Jane';
 console.log(unfrozenObj); // { name: 'Jane', age: 30 }
 ```

 In this example, the `unFreeze` function is called with a frozen object `{ name: 'John', age: 30 }`. It unfreezes the object using a deep copy function and returns a new object `{ name: 'Jane', age: 30 }`. The `name` property of the unfrozen object is then modified to `'Jane'`.

 **Note**: The `unFreeze` function can only be used with previously frozen objects. If an object was not frozen, calling `unFreeze` on it will simply return the same object without any modifications.
 */
export function unFreeze<T>(obj: T): T {
  if (!obj) return obj
  if (!Object.isFrozen(obj)) return obj
  return deepCopyObject(obj)
}
