/**
 * A collection that maintains unique keys, where each key is associated with a Set of values.
 * Allows adding, deleting, and retrieving values for specific keys, as well as managing the keys themselves.
 *
 * - Each key is unique and maps to a Set of values, ensuring that values under each key are also unique.
 * - Supports operations such as adding values to a key's Set, removing values, checking for existence of keys and values, and more.
 * - If no values are provided when adding a new key, an empty Set is created by default.
 *
 * @template K - The type of the keys in the collection.
 * @template V - The type of the values stored in the Sets associated with each key.
 */
export class UniqueKeySetCollection<K, V> {
  private map: Map<K, Set<V>>

  constructor() {
    this.map = new Map<K, Set<V>>()
  }

  /**
   * Adds values from an array to the Set associated with the specified key.
   * If the values array is not provided, it creates an empty Set.
   *
   * @param {K} key - The key under which the values are added.
   * @param {V[]} [values] - An array of values to add to the Set. If not provided, creates an empty Set.
   */
  add(key: K, values?: V[]): void {
    if (!this.map.has(key)) {
      this.map.set(key, new Set<V>())
    }

    if (values) {
      values.forEach((value) => this.map.get(key)?.add(value))
    }
  }

  /**
   * Removes values from an array in the Set associated with the specified key.
   *
   * @param {K} key - The key under which the values are removed.
   * @param {V[]} values - An array of values to remove from the Set.
   */
  deleteValue(key: K, values: V[]): void {
    const set = this.map.get(key)
    if (set) {
      values.forEach((value) => set.delete(value))
      // Remove the key if the Set becomes empty
      if (set.size === 0) {
        this.map.delete(key)
      }
    }
  }

  /**
   * Removes the key and its associated Set completely.
   *
   * @param {K} key - The key to remove.
   */
  deleteKey(key: K): void {
    this.map.delete(key)
  }

  /**
   * Checks if a value exists in the Set associated with the specified key.
   *
   * @param {K} key - The key to check.
   * @param {V} value - The value to look for in the Set.
   * @returns {boolean} - Returns true if the value exists in the Set for the given key.
   */
  hasValue(key: K, value: V): boolean {
    return this.map.has(key) && this.map.get(key)!.has(value)
  }

  /**
   * Returns the Set associated with the specified key.
   *
   * @param {K} key - The key to retrieve the Set for.
   * @returns {Set<V> | undefined} - The Set associated with the key, or undefined if the key does not exist.
   */
  get(key: K): Set<V> | undefined {
    return this.map.get(key)
  }

  /**
   * Checks if the key exists in the collection.
   *
   * @param {K} key - The key to check.
   * @returns {boolean} - Returns true if the key exists.
   */
  hasKey(key: K): boolean {
    return this.map.has(key)
  }

  /**
   * Returns all keys in the collection.
   *
   * @returns {K[]} - An array of all keys.
   */
  keys(): K[] {
    return Array.from(this.map.keys())
  }

  /**
   * Returns all Sets of values in the collection.
   *
   * @returns {Set<V>[]} - An array of all Sets.
   */
  values(): Set<V>[] {
    return Array.from(this.map.values())
  }

  /**
   * Returns the number of keys in the collection.
   *
   * @returns {number} - The size of the collection.
   */
  size(): number {
    return this.map.size
  }

  /**
   * Clears the entire collection.
   */
  clear(): void {
    this.map.clear()
  }
}
