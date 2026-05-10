export declare type PhoneFormat = {
  codeCountry: number
  mask: number[]
  codeCity: number[]
}

export declare interface ConvertToPhoneOptions {
  phoneFormats?: PhoneFormat[]
}

export declare function convertToPhone(value: string, options?: ConvertToPhoneOptions): string

export declare function convertToNumber(
  number: number | string,
  lengthInteger: number | 20,
  lengthDecimal: number | 0,
  separator: string,
  end: string,
  interval: number | 3,
  floatingPoint: string
): string

export declare function onkeydown(e: any): void

export declare function toPhone(e: any): void

export declare function toNumber(e: any, separator: string, lengthInteger: number | 20, lengthDecimal: number | 0): void
