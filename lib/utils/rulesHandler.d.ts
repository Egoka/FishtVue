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
