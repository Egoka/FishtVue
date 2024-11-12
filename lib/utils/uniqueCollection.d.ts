/**
 #### `UniqueKeySetCollection` Class Documentation

 The `UniqueKeySetCollection` class is a data structure that maintains unique keys, where each key is associated with a Set of values.
 This collection allows adding, deleting, and retrieving values for specific keys, as well as managing the keys themselves. It ensures that each key is unique and each value within the Set is unique.

 ##### Syntax
 ```typescript
 class UniqueKeySetCollection<K, V>
 ```

 ##### Type Parameters
 - `K`: The type of the keys in the collection.
 - `V`: The type of the values stored in the Sets associated with each key.

 ##### Methods
 - `add(key: K, values?: V[]): void`
   Adds values from an array to the Set associated with the specified key. If the values array is not provided, it creates an empty Set.

 - `deleteValue(key: K, values: V[]): void`
   Removes values from the Set associated with the specified key.

 - `deleteKey(key: K): void`
   Removes the key and its associated Set completely.

 - `hasValue(key: K, value: V): boolean`
   Checks if a value exists in the Set associated with the specified key.

 - `get(key: K): Set<V> | undefined`
   Returns the Set associated with the specified key.

 - `hasKey(key: K): boolean`
   Checks if the key exists in the collection.

 - `keys(): K[]`
   Returns all keys in the collection.

 - `values(): Set<V>[]`
   Returns all Sets of values in the collection.

 - `size(): number`
   Returns the number of keys in the collection.

 - `clear(): void`
   Clears the entire collection.

 ##### Example Usage
 ```typescript
 const collection = new UniqueKeySetCollection<string, string>();
 collection.add('key1', ['value1', 'value2']);
 collection.add('key2', ['value3']);
 collection.add('key3'); // Creates an empty Set

 console.log(collection.get('key1')); // Set { 'value1', 'value2' }
 console.log(collection.get('key2')); // Set { 'value3' }
 console.log(collection.hasValue('key1', 'value1')); // true

 collection.deleteValue('key1', ['value1']);
 console.log(collection.get('key1')); // Set { 'value2' }

 collection.deleteKey('key2');
 console.log(collection.keys()); // ['key1', 'key3']
 ```

 In the example above, the `UniqueKeySetCollection` is used to manage keys and their associated Sets of values. The `add` method is used to insert values into the Set for a specific key, and the `deleteValue` method removes values from the Set. The `deleteKey` method completely removes a key and its associated Set from the collection.

 The class ensures that keys are unique and that each Set associated with a key contains only unique values.
 */
export declare class UniqueKeySetCollection<K, V> {
  /**
   * Creates an instance of the `UniqueKeySetCollection` class.
   */
  constructor()

  /**
   * Adds values from an array to the Set associated with the specified key.
   * If the values array is not provided, it creates an empty Set.
   *
   * @param {K} key - The key under which the values are added.
   * @param {V[]} [values] - An array of values to add to the Set. If not provided, creates an empty Set.
   */
  add(key: K, values?: V[]): void

  /**
   * Removes values from an array in the Set associated with the specified key.
   *
   * @param {K} key - The key under which the values are removed.
   * @param {V[]} values - An array of values to remove from the Set.
   */
  deleteValue(key: K, values: V[]): void

  /**
   * Removes the key and its associated Set completely.
   *
   * @param {K} key - The key to remove.
   */
  deleteKey(key: K): void

  /**
   * Checks if a value exists in the Set associated with the specified key.
   *
   * @param {K} key - The key to check.
   * @param {V} value - The value to look for in the Set.
   * @returns {boolean} - Returns true if the value exists in the Set for the given key.
   */
  hasValue(key: K, value: V): boolean

  /**
   * Returns the Set associated with the specified key.
   *
   * @param {K} key - The key to retrieve the Set for.
   * @returns {Set<V> | undefined} - The Set associated with the key, or undefined if the key does not exist.
   */
  get(key: K): Set<V> | undefined

  /**
   * Checks if the key exists in the collection.
   *
   * @param {K} key - The key to check.
   * @returns {boolean} - Returns true if the key exists.
   */
  hasKey(key: K): boolean

  /**
   * Returns all keys in the collection.
   *
   * @returns {K[]} - An array of all keys.
   */
  keys(): K[]

  /**
   * Returns all Sets of values in the collection.
   *
   * @returns {Set<V>[]} - An array of all Sets.
   */
  values(): Set<V>[]

  /**
   * Returns the number of keys in the collection.
   *
   * @returns {number} - The size of the collection.
   */
  size(): number

  /**
   * Clears the entire collection.
   */
  clear(): void
}
