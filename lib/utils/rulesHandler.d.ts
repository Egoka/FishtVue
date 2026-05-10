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
} & Rule
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
  compareFields: any
} & Rule
export declare type CompareRule = Rule &
  Compare & {
    type: "compare"
  }

// ---------------------------------------
export declare type RulesArray = Array<
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
export declare type RulesObject = {
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

export declare type RuleMessageKey = keyof RulesObject

export function getValidate(value: any, rules: Rules): ReturnValid
export function isExistRule(rules: RulesArray | RulesObject, rule: keyof RulesObject): boolean
export function getAsyncValidate(value: any, rules: Rules): Promise<ReturnValid>
/**
 * Override default validation messages used when a rule does not provide its own `message`.
 * Pass a partial map of overrides — only the listed keys are replaced.
 * Pass an empty object (`{}`) to restore all built-in English defaults.
 */
export function setDefaultRuleMessages(messages: Partial<Record<RuleMessageKey, message>>): void
