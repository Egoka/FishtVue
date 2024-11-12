const arrPhone = [
  { codeCountry: 1, mask: [3, 2, 2, 7], codeCity: [] },
  { codeCountry: 7, mask: [3, 2, 2, 7], codeCity: [] },
  { codeCountry: 81, mask: [4, 4, 6], codeCity: [6, 75, 742] },
  { codeCountry: 82, mask: [4, 4, 6], codeCity: [2, 52, 51] },
  { codeCountry: 86, mask: [4, 4, 6], codeCity: [10, 20, 21] }
]
const strReg = arrPhone
  .map(
    (p) =>
      `^(${p.codeCountry})` +
      `(${p.codeCity.join("|") + (p.codeCity.length > 0 ? "|" : "")}\\d{1,3})` +
      `(\\d{0,${p.mask.join("})(\\d{0,") || 16}})`
  )
  .join("|")
const phoneRegular = RegExp(`${strReg + (strReg.length > 0 ? "|" : "")}^(\\d{1,18})`, "")
export const convertToPhone = (value: string): string => {
  if (!value) {
    return value
  }
  if (!value.match(/^[\d+]/m)) {
    return value.replace(/\D/g, "")
  }
  const x: any = value.replace(/\D/g, "").match(phoneRegular) || []
  if (x.length) {
    x.shift()
  } else {
    return "+"
  }
  const i = x.findIndex((index: any) => index)
  if (x[i].length) {
    if (arrPhone.some((p) => p.codeCountry === +x[i])) {
      // eslint-disable-next-line no-self-assign
      x[i] = x[i]
    } else if (x[i] === "9") {
      x[i] = "7"
      x[i + 1] = "9"
    } else {
      return "+" + x["input"]
    }
    value = `+${x[i]}`
  }
  if (x[i + 1]) {
    value += ` (${x[i + 1]}`
  }
  if (x[i + 2]) {
    value += `) ${x[i + 2]}`
  }
  if (x[i + 3]) {
    value += `-${x[i + 3]}`
  }
  if (x[i + 4]) {
    value += `-${x[i + 4]}`
  }
  if (x[i + 5]) {
    value += `-${x[i + 5]}`
  }
  return value
}
//////////////////////////////////////////////////////
export const convertToNumber = (
  number: number | string,
  lengthInteger = 20,
  lengthDecimal = 0,
  separator = "",
  end = "",
  interval = 3,
  floatingPoint = ""
): string => {
  if (!number) {
    return ""
  }
  number = String(number).replace(/[^0-9.]/g, "")
  if (!number.length) {
    return ""
  }
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
let keyup = {}
export const onkeydown = function (e: any) {
  keyup = e.key
  oldValue = e.target.value
}
export const toPhone = function (e: any) {
  let value = e.target.value
  let pos = e.target.selectionStart
  const lengthValue = e.target.value.length
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
  e.target.value = newValue
  if (keyup !== "Backspace") {
    pos += newValue.length - lengthValue
  }
  setTimeout(() => {
    e.target.setSelectionRange(pos, pos)
  }, 1)
}
//////////////////////////////////////////////////////
/////////////////NUMBER///////////////////////////////
//////////////////////////////////////////////////////
export const toNumber = function (e: any, separator = "", lengthInteger = 20, lengthDecimal = 0) {
  let value = e.target.value
  let pos = e.target.selectionStart
  if (keyup === "Backspace" && pos !== 0) {
    if (numberSpecialCharacters.includes(oldValue.substring(pos, pos + 1))) {
      const arrValue = [...value]
      arrValue.splice(pos - 1, 1, oldValue.substring(pos, pos + 1))
      value = arrValue.join("")
      pos -= 1
    }
  }
  const newValue = String(convertToNumber(value, lengthInteger, lengthDecimal, separator))
  e.target.value = newValue
  if (oldValue) {
    const degree = String(Math.trunc(Number(String(value).replace(/[^0-9.]/g, "")))).length - lengthInteger
    pos = pos + (newValue?.length - value?.length) + (degree > 0 ? degree : 0)
  }
  setTimeout(() => {
    e.target.setSelectionRange(pos, pos)
  }, 1)
}
