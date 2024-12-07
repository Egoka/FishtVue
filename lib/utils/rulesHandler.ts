import { FormValues } from "fishtvue/form"

type message = string
type ReturnValid = { isInvalid: boolean; message: string }

export declare interface RuleCallback {
  isInvalid: boolean
  message?: string
}

interface Rule {
  message?: message
  isActive?: boolean
}

// ---------------------------------------
export declare type RequiredRule = Rule & {
  type: "required"
}

export declare type EmailRule = Rule & {
  type: "email"
}

export declare type PhoneRule = Rule & {
  type: "phone"
}

export declare type NumericRule = Rule & {
  type: "numeric"
}
type Regular = {
  regular: RegExp | string
}
export declare type RegularRule = Rule &
  Regular & {
    type: "regular"
  }

type Range = {
  min?: number
  max?: number
} & Rule
export declare type RangeRule = Rule &
  Range & {
    type: "range"
  }

type Length = {
  min?: number
  max?: number
} & Rule
export declare type LengthRule = Rule &
  Length & {
    type: "length"
  }

type Async = {
  validationCallback(value: any): Promise<RuleCallback>
} & Rule
export declare type AsyncRule = Rule &
  Async & {
    type: "async"
  }

type Custom = {
  validationCallback(value: any): RuleCallback
} & Rule

export declare type CustomRule = Rule &
  Custom & {
    type: "custom"
  }

type Compare = {
  compareFields?: string[]
  validationCallback(value: any, compareFields: FormValues): RuleCallback
} & Rule
export declare type CompareRule = Rule &
  Compare & {
    type: "compare"
  }

// ---------------------------------------
type RulesArray = Array<
  | RequiredRule
  | EmailRule
  | PhoneRule
  | NumericRule
  | RegularRule
  | RangeRule
  | LengthRule
  | AsyncRule
  | CustomRule
  | CompareRule
>
type RuleObject = message | boolean | Rule
type RulesObject = {
  required?: RuleObject
  email?: RuleObject
  phone?: RuleObject
  numeric?: RuleObject
  regular?: Regular
  range?: Range
  length?: Length
  async?: Async
  custom?: Custom
  compare?: Compare
}
export declare type Rules = RulesArray | RulesObject

// ---------------------------------------

import { required, email, phone, numeric, regular, range, length } from "./rulesMethods"
import { fieldsPick } from "fishtvue/utils/objectHandler"

const listRules: Record<keyof RulesObject, any> = {
  required,
  email,
  phone,
  numeric,
  regular,
  range,
  length,
  async: undefined,
  custom: undefined,
  compare: undefined
}
const arrayRules: Array<keyof RulesObject> = [
  "required",
  "email",
  "phone",
  "numeric",
  "regular",
  "range",
  "length",
  "async",
  "custom",
  "compare"
]
const defaultMessages: Record<keyof RulesObject, message> = {
  required: "Required field",
  email: "Invalid email",
  phone: "Invalid phone",
  numeric: "Invalid numeric",
  regular: "The value does not satisfy the rule",
  range: "The value is not within the set range",
  length: "Invalid length value",
  async: "Invalid field",
  custom: "Invalid field",
  compare: "The field does not fall off"
}

function toRulesArray(rules: RulesArray | RulesObject): RulesArray {
  return Array.isArray(rules)
    ? (rules
        .map((rule) => {
          if (!arrayRules.find((name) => rule.type === name)) return
          return {
            ...rule,
            message: rule?.message ?? defaultMessages[rule.type],
            isActive: rule?.isActive ?? true
          }
        })
        .filter(Boolean) as RulesArray)
    : ((Object.keys(rules) as Array<keyof RulesObject>)
        .map((rule: keyof RulesObject) => {
          const type = rule
          const message =
            typeof rules[rule] === "string"
              ? rules[rule]
              : typeof rules[rule] === "boolean"
                ? rules[rule]
                  ? defaultMessages[rule]
                  : ""
                : typeof rules[rule] === "object"
                  ? ((rules[rule] as Rule)?.message ?? "")
                  : ""
          const isActive =
            typeof rules[rule] === "boolean"
              ? rules[rule]
              : typeof rules[rule] === "object"
                ? ((rules[rule] as Rule)?.isActive ?? true)
                : true
          if (rule === "required" || rule === "email" || rule === "phone" || rule === "numeric")
            return { type, message, isActive } as Rule & { type: keyof RulesObject }
          else if (rule === "regular")
            return { type, message, isActive, regular: rules[rule]?.regular ?? "" } as RegularRule
          else if (rule === "range" || rule === "length")
            return { type, message, isActive, min: rules[rule]?.min, max: rules[rule]?.max } as RangeRule | LengthRule
          else if (rule === "async")
            return { type, message, isActive, validationCallback: rules[rule]?.validationCallback } as AsyncRule
          else if (rule === "custom")
            return { type, message, isActive, validationCallback: rules[rule]?.validationCallback } as CustomRule
          else if (rule === "compare")
            return {
              type,
              message,
              isActive,
              compareField: rules[rule]?.compareFields,
              validationCallback: rules[rule]?.validationCallback
            } as CompareRule
        })
        .filter(Boolean) as RulesArray)
}

export function getValidate(value: any, rules: Rules, formFields: FormValues): ReturnValid {
  const orderOfRules: RulesArray = toRulesArray(rules)
  let message: string = ""
  const isInvalid = orderOfRules.some((rule) => {
    if (!rule.isActive) return false
    if (rule.type === "required" || rule.type === "email" || rule.type === "phone" || rule.type === "numeric") {
      if (!listRules?.[rule.type](value)) {
        message = rule.message ?? defaultMessages[rule.type]
        return true
      }
    } else if (rule.type === "regular") {
      if (!regular(value, rule?.regular || "")) {
        message = rule.message ?? defaultMessages[rule.type]
        return true
      }
    } else if (rule.type === "range" || rule.type === "length") {
      if (!listRules?.[rule.type](value, rule?.min, rule?.max)) {
        message = rule.message ?? defaultMessages[rule.type]
        return true
      }
    } else if (rule.type === "custom") {
      const result = rule?.validationCallback(value)
      if (result !== undefined && result?.isInvalid) {
        message = result?.message ?? rule?.message ?? ""
        return true
      }
    } else if (rule.type === "compare") {
      const result = rule?.validationCallback(
        value,
        rule?.compareFields && rule?.compareFields?.length ? fieldsPick(formFields, rule?.compareFields) : formFields
      )
      if (result !== undefined && result?.isInvalid) {
        message = result?.message ?? rule?.message ?? ""
        return true
      }
    }
  })
  return { isInvalid, message }
}

export function isExistRule(rules: RulesArray | RulesObject, rule: keyof RulesObject): boolean {
  return !!(Object.keys(rules).includes(rule) || (Array.isArray(rules) && rules.find((item) => item.type === rule)))
}

export async function getAsyncValidate(value: any, rules: Rules): Promise<ReturnValid> {
  let isInvalid: boolean = false
  let message: string = ""
  const asyncRule = toRulesArray(rules).find((rule) => rule.type === "async") as AsyncRule | undefined
  if (!asyncRule) return { isInvalid, message }
  if (!asyncRule?.isActive) return { isInvalid, message }
  const result = await asyncRule?.validationCallback(value)
  if (result !== undefined) {
    isInvalid = result.isInvalid
    message = result.message ?? asyncRule?.message ?? ""
  }
  return { isInvalid, message }
}
