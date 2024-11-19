type message = string

export declare interface ResultCallback {
  isInvalid: boolean
  message?: string
}

interface Rule {
  message?: message
}

// ---------------------------------------
export declare interface RequiredRule extends Rule {}

export declare interface EmailRule extends Rule {}

export declare interface PhoneRule extends Rule {}

export declare interface NumericRule extends Rule {}

export declare interface RegularRule extends Rule {
  regular: RegExp | string
}

export declare interface RangeRule extends Rule {
  min?: number
  max?: number
}

export declare interface LengthRule extends Rule {
  min?: number
  max?: number
}

export declare interface AsyncRule extends Rule {
  validationCallback(value: any): Promise<ResultCallback>
}

export declare interface CustomRule extends Rule {
  validationCallback(value: any): ResultCallback
}

export declare interface CompareRule extends Rule {
  compareField: any
}

// ---------------------------------------
export declare type Rules = {
  required?: RequiredRule | message | boolean
  email?: EmailRule | message
  phone?: PhoneRule | message
  numeric?: NumericRule | message
  regular?: RegularRule
  range?: RangeRule
  length?: LengthRule
  async?: AsyncRule
  custom?: CustomRule
  compare?: CompareRule
}

const emptyData = [undefined, null, ""]

function required(value: boolean | string | number | { [index: string]: any } | [any]): boolean {
  if (value) {
    if (Array.isArray(value) || typeof value === "string") {
      return !!value?.length
    } else if (Object.prototype.toString.call(value) === "[object Date]" || typeof value === "number") {
      return true
    } else if (Object.values(value)?.length) {
      return !!Object.values(value)?.filter((i) => i).length
    } else {
      return !!value
    }
  }
  return false
}

function email(value: string) {
  if (emptyData.includes(value)) {
    return false
  }
  return !value.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)?.[0]
}

function phone(value: string) {
  if (emptyData.includes(value)) {
    return false
  }
  return !value.match(
    /^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{1,3})[-. )]*)?((\d{1,4})[-. ]*(\d{0,4})[-. ]*(\d{0,4})[-. ]*(\d{0,7}))$/m
  )
}

function numeric(value: string) {
  if (emptyData.includes(value)) {
    return false
  }
  return !value.match(/^\d+$/)?.[0]
}

function regular(value: string, regular: RegExp | string) {
  if (emptyData.includes(value)) {
    return false
  }
  return typeof regular === "string" ? !value.match(new RegExp(regular))?.[0] : !value.match(regular)?.[0]
}

function range(value: string | any, min: number | undefined, max: number | undefined) {
  if (typeof value !== "string") {
    return false
  }
  if (emptyData.includes(value)) {
    return false
  }
  if (!value.match(/^\d+$/)?.[0]) return true
  if (min && +value < min) return true
  if (max && +value > max) return true
}

function length(value: string, min: number | undefined, max: number | undefined) {
  if (emptyData.includes(value)) {
    return false
  }
  if (min && value.length < min) return true
  if (max && value.length > max) return true
}

export function getValidate(value: any, field: any): { isInvalid: boolean; message: string } {
  const rules: Rules = field.rules
  let message: string = ""
  const arrayOfOrderRules = ["required", "email", "phone", "numeric", "regular", "range", "length", "custom", "compare"]
  const isInvalid = arrayOfOrderRules
    .filter((rule) => Object.keys(rules).includes(rule))
    .some((rule) => {
      if (rule === "required") {
        if (!required(value)) {
          message =
            typeof rules["required"] === "string"
              ? rules["required"] || ""
              : typeof rules["required"] === "boolean"
                ? rules["required"]
                  ? "Required field"
                  : ""
                : rules["required"]?.message || ""
          return true
        }
      } else if (rule === "email") {
        if (email(value)) {
          message = typeof rules["email"] === "string" ? rules["email"] || "" : rules["email"]?.message || ""
          return true
        }
      } else if (rule === "phone") {
        if (phone(value)) {
          message = typeof rules["phone"] === "string" ? rules["phone"] || "" : rules["phone"]?.message || ""
          return true
        }
      } else if (rule === "numeric") {
        if (numeric(value)) {
          message = typeof rules["numeric"] === "string" ? rules["numeric"] || "" : rules["numeric"]?.message || ""
          return true
        }
      } else if (rule === "regular") {
        if (regular(value, rules["regular"]?.regular || "")) {
          message = rules["regular"]?.message || ""
          return true
        }
      } else if (rule === "range") {
        if (range(value, rules["range"]?.min, rules["range"]?.max)) {
          message = rules["range"]?.message || ""
          return true
        }
      } else if (rule === "length") {
        if (length(value, rules["length"]?.min, rules["length"]?.max)) {
          message = rules["length"]?.message || ""
          return true
        }
      } else if (rule === "custom") {
        const result = rules["custom"]?.validationCallback(value)
        if (result !== undefined && result?.isInvalid) {
          message = result?.message || rules["custom"]?.message || ""
          return true
        }
      } else if (rule === "compare") {
        // if (rules["compare"]?.compareField) {
        //   message = rules["compare"]?.message||""
        //   return true
        // }
      }
    })
  return { isInvalid, message }
}

export async function getAsyncValidate(value: any, field: any) {
  const rules: Rules = field.rules
  let isInvalid: boolean = false
  let message: string = ""
  const result = await rules["async"]?.validationCallback(value)
  if (result !== undefined) {
    isInvalid = result.isInvalid
    message = result.message || rules["async"]?.message || ""
  }
  return { isInvalid, message }
}
