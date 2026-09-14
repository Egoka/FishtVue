import { describe, expect, it } from "vitest"
import { convertMask, formatDate } from "fishtvue/utils/dateHandler"

/**
 * Маски `formatDate` (_utilities.md Issue 4 — непокрытый блок).
 *
 * Coverage показывал непокрытыми строки switch'а внутри `formatDate`, и это было не «забыли
 * протестировать», а **недостижимый код**: `mask = convertMask(mask)` выполняется до switch и
 * переписывает маску, поэтому ни одна метка (`"Do"`, `"W"`, `"WW"`, `"WWW"`, `"WWWW"`, `"L"`,
 * `"ZZ"`, `"ZZZ"`, `"ZZZZ"`) совпасть не могла — на вход switch приходили уже `do`, `w`, `ww`,
 * `EEE`, `EEEE`, `P`, `xx`, `xxx`, `zzzz`.
 *
 * Единственной достижимой веткой была `case "a"` — потому что и `A`, и `a` конвертируются в `a`.
 * Из-за этого `formatDate(date, "A")` возвращала `"pm"` вместо `"PM"`, хотя мёртвая ветка `case "A"`
 * рядом объявляла верхний регистр.
 *
 * Дальше зафиксировано фактическое поведение по каждой маске — оно и есть контракт.
 */
const DATE = new Date(2024, 2, 5, 14, 30) // вторник, 5 марта 2024, 14:30

describe("convertMask — dayjs → date-fns", () => {
  it.each([
    ["Do", "do"],
    ["A", "a"],
    ["a", "a"],
    ["W", "w"],
    ["WW", "ww"],
    ["WWW", "EEE"],
    ["WWWW", "EEEE"],
    ["L", "P"],
    ["ZZ", "xx"],
    ["ZZZ", "xxx"],
    ["ZZZZ", "zzzz"]
  ])("%s → %s", (from, to) => {
    expect(convertMask(from)).toBe(to)
  })

  it("A и a схлопываются в одну маску — регистр по ней уже не восстановить", () => {
    // Ровно отсюда и рос баг: различать их можно только по ИСХОДНОЙ маске, до конвертации.
    expect(convertMask("A")).toBe(convertMask("a"))
  })

  it("пропускает разделители и неизвестные символы как есть", () => {
    expect(convertMask("DD.MM.YYYY")).toBe("dd.MM.yyyy")
    expect(convertMask("YYYY-MM-DD")).toBe("yyyy-MM-dd")
  })
})

describe("formatDate — регистр AM/PM (регрессия)", () => {
  it("маска A даёт ВЕРХНИЙ регистр", () => {
    expect(formatDate(DATE, "A")).toBe("PM")
  })

  it("маска a даёт нижний регистр", () => {
    expect(formatDate(DATE, "a")).toBe("pm")
  })

  it("до полудня — AM/am", () => {
    const morning = new Date(2024, 2, 5, 9, 0)
    expect(formatDate(morning, "A")).toBe("AM")
    expect(formatDate(morning, "a")).toBe("am")
  })

  it("ровно полдень считается PM", () => {
    expect(formatDate(new Date(2024, 2, 5, 12, 0), "A")).toBe("PM")
  })

  it("полночь считается AM", () => {
    expect(formatDate(new Date(2024, 2, 5, 0, 0), "A")).toBe("AM")
  })
})

describe("formatDate — остальные маски (зафиксированное поведение)", () => {
  it.each([
    ["Do", "5th"],
    ["WWW", "Tue"],
    ["WWWW", "Tuesday"]
  ])("маска %s → %s", (mask, expected) => {
    expect(formatDate(DATE, mask as any)).toBe(expected)
  })

  it("W и WW отдают номер недели года, а не день недели", () => {
    // Семантика dayjs. Мёртвая ветка switch объявляла getDay()/EEEEEE — то есть день недели;
    // текущее поведение ближе к dayjs, поэтому менять его при удалении мёртвого кода не стали.
    expect(formatDate(DATE, "W")).toBe("10")
    expect(formatDate(DATE, "WW")).toBe("10")
  })

  it("L — локализованная дата", () => {
    expect(formatDate(DATE, "L")).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
  })

  it.each([
    ["ZZ", /^[+-]\d{4}$/],
    ["ZZZ", /^[+-]\d{2}:\d{2}$/],
    ["ZZZZ", /^GMT[+-]\d{2}:\d{2}$/]
  ])("маска %s — смещение таймзоны", (mask, shape) => {
    expect(formatDate(DATE, mask as any)).toMatch(shape)
  })
})

describe("formatDate — разбор входного значения", () => {
  it("принимает Date как есть", () => {
    expect(formatDate(DATE, "DD.MM.YYYY")).toBe("05.03.2024")
  })

  it("принимает ISO-datetime", () => {
    expect(formatDate("2024-03-05T14:30:00", "DD.MM.YYYY")).toBe("05.03.2024")
  })

  it("принимает ISO-дату", () => {
    expect(formatDate("2024-03-05", "DD.MM.YYYY")).toBe("05.03.2024")
  })

  it("принимает русский формат dd.MM.yyyy", () => {
    expect(formatDate("05.03.2024", "YYYY-MM-DD")).toBe("2024-03-05")
  })

  it("принимает timestamp", () => {
    expect(formatDate(DATE.getTime(), "DD.MM.YYYY")).toBe("05.03.2024")
  })

  it("падает на неразбираемой строке", () => {
    expect(() => formatDate("не дата", "DD.MM.YYYY")).toThrow("Invalid date")
  })

  it("падает на невалидном Date", () => {
    expect(() => formatDate(new Date("нет"), "DD.MM.YYYY")).toThrow("Invalid date")
  })
})

describe("formatDate — определение локали", () => {
  it("кириллица в маске включает русскую локаль", () => {
    expect(formatDate(DATE, "D MMMM YYYY г.")).toContain("марта")
  })

  it("явная локаль в options приоритетнее автоопределения", async () => {
    const { de } = await import("date-fns/locale")
    expect(formatDate(DATE, "MMMM", { locale: de } as any)).toBe("März")
  })

  it("формат dd.MM.yyyy на входе трактуется как русская локаль", () => {
    expect(formatDate("05.03.2024", "MMMM")).toBe("марта")
  })

  it("формат MM/dd/yyyy на входе трактуется как en-US", () => {
    expect(formatDate("03/05/2024", "MMMM")).toBe("March")
  })
})
