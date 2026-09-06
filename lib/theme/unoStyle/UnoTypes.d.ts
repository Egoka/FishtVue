export declare type StyleType = {
  styleName?: string
  reg?: RegExp | Record<string, RegExp>
  getValue(value: string): string | undefined
}

export declare type GroupsRegExp = {
  style: string
  special: string
  abstract: string
  custom: string
  [key: string]: string
}
export declare type PseudoClasses = {
  // prettier-ignore
  userInteractionStates: Record<
    | "hover"
    | "focus"
    | "focus-within"
    | "focus-visible"
    | "active"
    | "visited"
    | "target",
    // | "has",
    string
  >
  formElementStates: Record<
    | "disabled"
    | "enabled"
    | "checked"
    | "indeterminate"
    | "default"
    | "required"
    | "valid"
    | "invalid"
    | "in-range"
    | "out-of-range"
    | "placeholder-shown"
    | "autofill"
    | "read-only"
    | "optional"
    | "user-valid"
    | "user-invalid",
    string
  >
  // prettier-ignore
  structuralPseudoClasses: Record<
    | "first"
    | "last"
    | "only"
    | "odd"
    | "even"
    | "first-of-type"
    | "last-of-type"
    | "only-of-type"
    | "empty",
    string
  >
  // prettier-ignore
  pseudoContent: Record<
    | "before"
    | "after",
    string
  >
  // prettier-ignore
  pseudoElements: Record<
    | "first-letter"
    | "first-line"
    | "marker"
    | "selection"
    | "file"
    | "backdrop"
    | "placeholder"
    | "details-content",
    string
  >
  // prettier-ignore
  specialStates: Record<
    | "open"
    | "inert"
    | "rtl"
    | "ltr",
    string
  >
}
export declare type Modifier = Partial<{
  state: string
  stateName: string
  abstract: string
  child: string
  descendant: string
  // Issue 2 (uno-engine.md): v4-варианты волны 3.
  not: string
  notInner: string
  inVariant: string
  inInner: string
  nth: string
  nthValue: string
  nthAbstract: string
  stateRel: string
  stateSel: string
  stateSelDyn: string
  stateSelAbstract: string
  stateSelBool: string
  stateRelName: string
  container: string
  containerName: string
  containerDynamic: string
  containerAbstract: string
  containerDynamicName: string
  supportsNamed: string
  supportsFeature: string
  has: string
  hasValue: string
  hasNamed: string
  selectorsBoolean: string
  media: string[]
  mediaDynamic: string
  mediaAbstract: string
  selectors: string
  selectorsDynamic: string
  selectorsAbstract: string
  pseudoClasses: string
  userInteractionStates: keyof PseudoClasses["userInteractionStates"]
  formElementStates: keyof PseudoClasses["formElementStates"]
  structuralPseudoClasses: keyof PseudoClasses["structuralPseudoClasses"]
  pseudoContent: keyof PseudoClasses["pseudoContent"]
  pseudoElements: keyof PseudoClasses["pseudoElements"]
  specialStates: keyof PseudoClasses["specialStates"]
}>
