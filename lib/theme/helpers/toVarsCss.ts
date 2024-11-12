export default <T extends Record<string, string | T>>(obj: T, prefix = ""): string => {
  function flattenObject(obj: T, parentKey = "", result = {}): Record<string, string> {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const newKey = parentKey ? `${parentKey}-${key}` : key
        if (typeof obj[key] === "object" && obj[key] !== null) {
          flattenObject(obj[key] as T, newKey, result)
        } else {
          // @ts-ignore
          result[newKey] = obj[key]
        }
      }
    }
    return result
  }

  const resultCss = flattenObject(obj)
  return (
    Object.keys(resultCss).reduce(
      (res: string, item: string) => (res += `\n    --${prefix ? prefix + "-" : ""}${item}: ${resultCss[item]};`),
      ""
    ) + "\n  "
  )
}
