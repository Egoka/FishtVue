import { describe, it, expect, beforeEach } from "vitest"
import { UniqueKeySetCollection } from "fishtvue/utils/uniqueCollection"

describe("UniqueKeySetCollection", () => {
  let collection: UniqueKeySetCollection<string, string>

  beforeEach(() => {
    collection = new UniqueKeySetCollection<string, string>()
  })

  describe("add", () => {
    it("should add single values to the Set associated with the key", () => {
      collection.add("key1", ["value1"])
      expect(collection.get("key1")).toEqual(new Set(["value1"]))
    })

    it("should add multiple values to the Set associated with the key", () => {
      collection.add("key1", ["value1", "value2"])
      expect(collection.get("key1")).toEqual(new Set(["value1", "value2"]))
    })

    it("should create an empty Set if no values are provided", () => {
      collection.add("key1")
      expect(collection.get("key1")).toEqual(new Set())
    })
  })

  describe("deleteValue", () => {
    it("should remove specified values from the Set associated with the key", () => {
      collection.add("key1", ["value1", "value2"])
      collection.deleteValue("key1", ["value1"])
      expect(collection.get("key1")).toEqual(new Set(["value2"]))
    })

    it("should remove the key if the Set becomes empty", () => {
      collection.add("key1", ["value1"])
      collection.deleteValue("key1", ["value1"])
      expect(collection.get("key1")).toBeUndefined()
    })
  })

  describe("deleteKey", () => {
    it("should remove the key and its associated Set completely", () => {
      collection.add("key1", ["value1"])
      collection.deleteKey("key1")
      expect(collection.get("key1")).toBeUndefined()
    })
  })

  describe("hasValue", () => {
    it("should return true if the value exists in the Set for the given key", () => {
      collection.add("key1", ["value1"])
      expect(collection.hasValue("key1", "value1")).toBe(true)
    })

    it("should return false if the value does not exist in the Set for the given key", () => {
      collection.add("key1", ["value1"])
      expect(collection.hasValue("key1", "value2")).toBe(false)
    })
  })

  describe("get", () => {
    it("should return the Set associated with the key", () => {
      collection.add("key1", ["value1"])
      expect(collection.get("key1")).toEqual(new Set(["value1"]))
    })

    it("should return undefined if the key does not exist", () => {
      expect(collection.get("nonExistentKey")).toBeUndefined()
    })
  })

  describe("hasKey", () => {
    it("should return true if the key exists in the collection", () => {
      collection.add("key1", ["value1"])
      expect(collection.hasKey("key1")).toBe(true)
    })

    it("should return false if the key does not exist in the collection", () => {
      expect(collection.hasKey("nonExistentKey")).toBe(false)
    })
  })

  describe("keys", () => {
    it("should return all keys in the collection", () => {
      collection.add("key1", ["value1"])
      collection.add("key2", ["value2"])
      expect(collection.keys()).toEqual(["key1", "key2"])
    })
  })

  describe("values", () => {
    it("should return all Sets of values in the collection", () => {
      collection.add("key1", ["value1"])
      collection.add("key2", ["value2", "value3"])
      expect(collection.values()).toEqual([new Set(["value1"]), new Set(["value2", "value3"])])
    })
  })

  describe("size", () => {
    it("should return the number of keys in the collection", () => {
      collection.add("key1", ["value1"])
      collection.add("key2", ["value2"])
      expect(collection.size()).toBe(2)
    })
  })

  describe("clear", () => {
    it("should clear the entire collection", () => {
      collection.add("key1", ["value1"])
      collection.add("key2", ["value2"])
      collection.clear()
      expect(collection.size()).toBe(0)
      expect(collection.get("key1")).toBeUndefined()
      expect(collection.get("key2")).toBeUndefined()
    })
  })
})
