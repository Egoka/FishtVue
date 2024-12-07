const emptyData = [undefined, null, ""]

export function required(value: boolean | string | number | { [index: string]: any } | [any]): boolean {
  if (value) {
    if (Array.isArray(value) || typeof value === "string") return !!value?.length
    else if (Object.prototype.toString.call(value) === "[object Date]" || typeof value === "number") return true
    else if (Object.values(value)?.length) return !!Object.values(value)?.filter((i) => i).length
    else if ((typeof value as any) === "symbol") return false
    else if ((typeof value as any) === "function") return false
    else return !!value
  }
  return false
}

export function email(value: string): boolean {
  if ((typeof value as any) !== "string" || emptyData.includes(value)) return true
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/.test(value)
}

export function phone(value: string): boolean {
  if ((typeof value as any) !== "string" || emptyData.includes(value)) return true
  const phoneRegex = /^\+?(\d{1,3})?[-. (]*\d{3}[-. )]*\d{3}[-. ]*\d{4}$/
  return phoneRegex.test(value) && !/[-. ]{2,}/.test(value)
  // return !value.match(
  //   /^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{1,3})[-. )]*)?((\d{1,4})[-. ]*(\d{0,4})[-. ]*(\d{0,4})[-. ]*(\d{0,7}))$/m
  // )
}

export function numeric(value: string): boolean {
  if ((typeof value as any) !== "string" || emptyData.includes(value)) return true
  return !!value.match(/^\d+$/)?.[0]
}

export function regular(value: string, regular: RegExp | string): boolean {
  if ((typeof value as any) !== "string" || emptyData.includes(value)) return true
  if (typeof regular !== "string" && !((regular as any) instanceof RegExp)) return true
  return (typeof regular as any) === "string"
    ? new RegExp(regular).test(value)
    : (regular as unknown as RegExp).test(value)
}

export function range(value: string | any, min: number | undefined, max: number | undefined): boolean {
  if (typeof value !== "string") return true
  if (emptyData.includes(value)) return true
  if (!value.match(/^\d+$/)?.[0]) return false
  if (min && +value < min) return false
  if (max && +value > max) return false
  else return true
}

export function length(value: string, min: number | undefined, max: number | undefined): boolean {
  if (emptyData.includes(value)) return true
  if (min && value.length < min) return false
  if (max && value.length > max) return false
  return true
}
