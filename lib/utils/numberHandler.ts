export type PhoneFormat = {
  codeCountry: number
  mask: number[]
  codeCity: number[]
}

export interface ConvertToPhoneOptions {
  phoneFormats?: PhoneFormat[]
}

const defaultPhoneFormats: PhoneFormat[] = [
  { codeCountry: 1, mask: [3, 2, 2, 7], codeCity: [] },
  { codeCountry: 7, mask: [3, 2, 2, 7], codeCity: [] },
  { codeCountry: 81, mask: [4, 4, 6], codeCity: [6, 75, 742] },
  { codeCountry: 82, mask: [4, 4, 6], codeCity: [2, 52, 51] },
  { codeCountry: 86, mask: [4, 4, 6], codeCity: [10, 20, 21] }
]

function buildPhoneRegex(formats: PhoneFormat[]): RegExp {
  const strReg = formats
    .map(
      (p) =>
        `^(${p.codeCountry})` +
        `(${p.codeCity.join("|") + (p.codeCity.length > 0 ? "|" : "")}\\d{1,3})` +
        `(\\d{0,${p.mask.join("})(\\d{0,") || 16}})`
    )
    .join("|")
  return RegExp(`${strReg + (strReg.length > 0 ? "|" : "")}^(\\d{1,18})`, "")
}

const defaultPhoneRegex = buildPhoneRegex(defaultPhoneFormats)

export function convertToPhone(value: string, options?: ConvertToPhoneOptions): string {
  if (!value) return value
  if (!value.match(/^[\d+]/m)) return value.replace(/\D/g, "")
  const formats = options?.phoneFormats && options.phoneFormats.length > 0 ? options.phoneFormats : defaultPhoneFormats
  const regex = formats === defaultPhoneFormats ? defaultPhoneRegex : buildPhoneRegex(formats)
  const x: any = value.replace(/\D/g, "").match(regex) || []
  if (x.length) x.shift()
  else return "+"
  const i = x.findIndex((index: any) => index)
  if (x[i].length) {
    if (formats.some((p) => p.codeCountry === +x[i])) {
      // eslint-disable-next-line no-self-assign
      x[i] = x[i]
    } else if (x[i] === "9") {
      x[i] = "7"
      x[i + 1] = "9"
    } else return "+" + x["input"]
    value = `+${x[i]}`
  }
  if (x[i + 1]) value += ` (${x[i + 1]}`
  if (x[i + 2]) value += `) ${x[i + 2]}`
  if (x[i + 3]) value += `-${x[i + 3]}`
  if (x[i + 4]) value += `-${x[i + 4]}`
  if (x[i + 5]) value += `-${x[i + 5]}`
  return value
}

//////////////////////////////////////////////////////
export function convertToNumber(
  number: number | string,
  lengthInteger = 20,
  lengthDecimal = 0,
  separator = "",
  end = "",
  interval = 3,
  floatingPoint = ""
): string {
  if (!number) return ""
  number = String(number).replace(/[^0-9.]/g, "")
  if (!number.length) return ""
  const re = "\\d(?=(\\d{" + interval + "})+" + (lengthDecimal > 0 ? "\\D" : "$") + ")"
  const degree = String(Math.trunc(+number)).length - lengthInteger
  number = +number / 10 ** (degree > 0 ? degree : 0)
  number = `${number}${lengthDecimal > 0 ? (number % 1 == 0 ? "." : "") : ""}${"0".repeat(lengthDecimal)}`
  number = String(
    String(number).match(new RegExp(`(\\d+).(\\d{0,${lengthDecimal > 0 ? lengthDecimal : "-"}})|(\\d+)`))?.[0]
  )
  return (
    (floatingPoint ? number.replace(".", floatingPoint) : number).replace(new RegExp(re, "g"), "$&" + separator) + end
  )
}

//////////////////////////////////////////////////////
/////////////////PHONE////////////////////////////////
//////////////////////////////////////////////////////
const phoneSpecialCharacters = [" ", "+", "(", ")", "-"]
const numberSpecialCharacters = [" ", "."]
let oldValue = ""
let keyup: string = ""

export function onkeydown(e: KeyboardEvent): void {
  keyup = e.key
  const target = e.target as HTMLInputElement
  oldValue = target.value
}

export function toPhone(e: InputEvent): void {
  const target = e.target as HTMLInputElement
  if (!target) return

  let value = target.value
  let pos = target.selectionStart ?? 0
  const lengthValue = target.value.length
  if (keyup === "Backspace" && pos !== 0) {
    if (phoneSpecialCharacters.includes(oldValue.substring(pos, pos + 1))) {
      const deleteIndex = value.substring(0, pos).replace(/\D/g, "").length - 1
      const arrValue = [...value.replace(/\D/g, "")]
      arrValue.splice(deleteIndex, 1)
      value = arrValue.join("")
      pos -= 1
    }
  }
  const newValue = convertToPhone(value)
  target.value = newValue
  if (keyup !== "Backspace") pos += newValue.length - lengthValue
  setTimeout(() => {
    if (target.type !== "number") {
      target.setSelectionRange(pos, pos)
    }
  }, 1)
}

//////////////////////////////////////////////////////
/////////////////NUMBER///////////////////////////////
//////////////////////////////////////////////////////
export function toNumber(e: InputEvent, separator = "", lengthInteger = 20, lengthDecimal = 0): void {
  const target = e.target as HTMLInputElement
  if (!target) return

  let value = target.value
  let pos = target.selectionStart ?? 0
  if (keyup === "Backspace" && pos !== 0) {
    if (numberSpecialCharacters.includes(oldValue.substring(pos, pos + 1))) {
      const arrValue = [...value]
      arrValue.splice(pos - 1, 1, oldValue.substring(pos, pos + 1))
      value = arrValue.join("")
      pos -= 1
    }
  }
  const newValue = String(convertToNumber(value, lengthInteger, lengthDecimal, separator))
  target.value = newValue
  if (oldValue) {
    const degree = String(Math.trunc(Number(String(value).replace(/[^0-9.]/g, "")))).length - lengthInteger
    pos = pos + (newValue?.length - value?.length) + (degree > 0 ? degree : 0)
  }
  setTimeout(() => {
    if (target.type !== "number") {
      target.setSelectionRange(pos, pos)
    }
  }, 1)
}

export function isNumber(value: number, positiveOnly = false): boolean {
  if (typeof (value as any) !== "number" || isNaN(value)) return false
  if (positiveOnly) return value > 0
  return true
}
