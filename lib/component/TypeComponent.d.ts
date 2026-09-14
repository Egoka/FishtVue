import type { ComponentsOptions, OptionsTheme } from "fishtvue/config"
import { ClassesMap, StyleClass, StyleMode } from "fishtvue/types"
import { DefaultMessages } from "fishtvue/locale"

export type NamesComponents = keyof ComponentsOptions | "BaseComponent"
export const cssComponents: Map<NamesComponents, string>

/**
 * Пара props стилизации потребителем (dev-patterns §2 A/B): `class` — только корень,
 * `classes` — карта внутренних элементов по ключам `{Name}ClassKey`.
 * @template K - union ключей элементов компонента
 */
export type ClassesProps<K extends string> = { class?: StyleClass; classes?: ClassesMap<K> }

/**
 * Адрес сегментов потребителя для `cls`/`raw`: один ключ элемента (`root` — корень)
 * либо массив ключей в порядке «общий → частный».
 * @template K - union ключей элементов компонента
 */
export type ClassesKey<K extends string> = K | "root" | Array<K | "root">

/**
 * Резолвер классов компонента — результат `Component.resolveClasses(props)`.
 * Один helper вместо рукописных `options?.x ?? "", props?.x ?? ""` в каждом computed.
 * @template K - union ключей элементов компонента
 */
export interface ClassesResolver<K extends string> {
  /**
   * Класс собственного DOM-элемента через `setStyle`:
   * `base… → options.classes[key] → props.classes[key] → (только root) options.class → props.class`.
   * База всегда до сегментов потребителя — twMerge отдаёт конфликт потребителю.
   * Массив ключей раскрывается слева направо («общий → частный»): `cls(["segment", "segmentStart"])`
   * даёт `options.segment → props.segment → options.segmentStart → props.segmentStart`.
   */
  cls(key: ClassesKey<K>, ...base: Array<StyleClass | boolean | undefined>): string
  /**
   * Только сегменты потребителя (`options.classes[key]` + `props.classes[key]`, для `root` — ещё и `class`),
   * без `setStyle`/префикса — для hand-off дочернему компоненту через его `:class` / `:classes`.
   * Массив ключей — как в `cls`.
   */
  raw(key: ClassesKey<K>): string
  /**
   * Aspect-ключ (заменяющая семантика): `props.classes[key] ?? options.classes[key] ?? fallback`.
   * Пустая строка в props отключает и options, и fallback.
   */
  pick(key: K, fallback?: StyleClass): StyleClass
}

/**
 * ## Class: Component
 *
 * The `Component` class is an exported default class that represents a component in the application.
 *
 * ### Properties
 *
 * - `name`: The name of the component.
 * - `prefix`: The prefix for the component.
 *
 * ### Constructor
 *
 * The constructor initializes the `Component` class and sets the necessary properties.
 *
 * ### Methods
 *
 * - `onBeforeMount(hook)`: A method that sets a hook to be executed before the component is mounted.
 * - `onMounted(hook)`: A method that sets a hook to be executed after the component is mounted.
 * - `onBeforeUpdate(hook)`: A method that sets a hook to be executed before the component is updated.
 * - `onUpdated(hook)`: A method that sets a hook to be executed after the component is updated.
 * - `onBeforeUnmount(hook)`: A method that sets a hook to be executed before the component is unmounted.
 * - `onUnmounted(hook)`: A method that sets a hook to be executed after the component is unmounted.
 * - `getOptions()`: A method that returns the options for the component.
 * - `getPrefix()`: A method that returns the prefix for the component.
 * - `initStyle(stylesComp)`: A method that initializes the style for the component.
 * - `setStyle(stylesComp, options?)`: компилирует tw-классы в CSS и возвращает `"fv {prefix}-{kebab-name} …"`; `options.consumer` — сегменты потребителя (последние в twMerge, переживают `unstyled`).
 * - `resolveClasses(props)`: резолвер `class`/`classes` — `cls(key, …base)`, `raw(key)`, `pick(key, fallback)` (dev-patterns §2 B–D).
 */
declare class Component<T extends keyof ComponentsOptions> {
  constructor(name?: T)
  readonly name?: T
  readonly prefix?: OptionsTheme["prefix"]

  /**
   * `onBeforeMount(hook)`: A method that sets a hook to be executed before the component is mounted.
   */
  onBeforeMount(hook: (instance: Pick<this, PublicFields>) => any): void

  /**
   * `onMounted(hook)`: A method that sets a hook to be executed after the component is mounted.
   */
  onMounted(hook: (instance: Pick<this, PublicFields>) => any): void

  /**
   * `onBeforeUpdate(hook)`: A method that sets a hook to be executed before the component is updated.
   */
  onBeforeUpdate(hook: (instance: Pick<this, PublicFields>) => any): void

  /**
   * `onUpdated(hook)`: A method that sets a hook to be executed after the component is updated.
   */
  onUpdated(hook: (instance: Pick<this, PublicFields>) => any): void

  /**
   * `onBeforeUnmount(hook)`: A method that sets a hook to be executed before the component is unmounted.
   */
  onBeforeUnmount(hook: (instance: Pick<this, PublicFields>) => any): void

  /**
   * `onUnmounted(hook)`: A method that sets a hook to be executed after the component is unmounted.
   */
  onUnmounted(hook: (instance: Pick<this, PublicFields>) => any): void

  /**
   * `getOptions()`: A method that returns the options for the component.
   */
  getOptions(): ComponentsOptions[T] | undefined

  /**
   * `getPrefix()`: A method that returns the prefix for the component.
   */
  getPrefix(): OptionsTheme["prefix"]

  /**
   * `initStyle(stylesComp)`: A method that initializes the style for the component.
   */
  initStyle(stylesComp?: StylesComponent): void

  /**
   * `setStyle(stylesComp, options?)`: главный API стилизации — компилирует tw-классы в CSS под
   * `.{prefix}-{kebab-name}`, регистрирует их и возвращает `"fv {prefix}-{kebab-name} …"`.
   * `options.consumer` — сегменты потребителя (`class`/`classes.*`): всегда последние в twMerge и
   * переживают `unstyled` (тогда результат — `"fv " + consumer`, база/mode не выдаются и не компилируются).
   */
  setStyle<T extends StyleClass | boolean | undefined>(stylesComp: T | T[], options?: SetStyleOptions): string
  /**
   * `resolveClasses(props)`: резолвер `class`/`classes` компонента (dev-patterns §2 B–D).
   * Читает `componentsOptions.X.class`/`.classes` из снимка опций и `props.class`/`props.classes` — реактивно,
   * если вызывать `cls`/`raw`/`pick` внутри `computed`.
   */
  resolveClasses<K extends string>(props: ClassesProps<K>): ClassesResolver<K>
  /**
   * `t(key, params?)`: локализованная строка по fallback chain `active → default → key`.
   * Опциональный `params` включает interpolation (`{name}` → `params[name]`) и pluralization
   * (если значение содержит `|`-формы и `params.count` — число, форма выбирается по CLDR-правилам активной локали).
   */
  t(key: keyof DefaultMessages | string, params?: Record<string, string | number>): string
  componentsStyle(): StyleMode | undefined
}

export type PublicFields =
  | "name"
  | "prefix"
  | "onBeforeMount"
  | "onMounted"
  | "onBeforeUpdate"
  | "onUpdated"
  | "onBeforeUnmount"
  | "onUnmounted"
  | "getOptions"
  | "getPrefix"
  | "initStyle"
/**
 * Опции `setStyle`: `selector` — кастомный CSS-scope вместо `.{prefix}-{kebab-name}`;
 * `consumer` — сегменты потребителя (см. `ClassesResolver.cls`).
 */
export type SetStyleOptions = Partial<{
  selector: string
  consumer: Array<StyleClass | boolean | undefined>
}>
export type StylesComponent = (layers: string, css: string) => string
export default Component
