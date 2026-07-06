import type { Component } from "vue"

// ---ISSUE 3 — реестр пользовательских типов полей для Form.
// Позволяет рендерить произвольный компонент по строковому `typeComponent`, не входящему
// во встроенный набор (Input/Aria/Select/Calendar/TextEditor/Switch). Module-level singleton —
// регистрация один раз на приложение (идиома `Loading.componentsMap`). Встроенные типы
// резолвятся раньше реестра, поэтому перекрыть их нельзя.
const fieldTypeRegistry = new Map<string, Component>()

/**
 * Регистрирует пользовательский тип поля под строковым именем `typeComponent`.
 *
 * @param {string} name - Имя типа поля, используется как `typeComponent` в структуре формы.
 * @param {Component} component - Vue-компонент, который Form отрендерит для этого типа.
 */
export function registerFieldType(name: string, component: Component): void {
  fieldTypeRegistry.set(name, component)
}

/**
 * Возвращает зарегистрированный компонент по имени типа.
 *
 * @param {string} name - Имя типа поля.
 * @returns {Component | undefined} - Компонент либо `undefined`, если тип не зарегистрирован.
 */
export function getFieldType(name: string): Component | undefined {
  return fieldTypeRegistry.get(name)
}

/**
 * Проверяет, зарегистрирован ли тип поля.
 *
 * @param {string} name - Имя типа поля.
 * @returns {boolean} - `true`, если тип зарегистрирован.
 */
export function hasFieldType(name: string): boolean {
  return fieldTypeRegistry.has(name)
}
