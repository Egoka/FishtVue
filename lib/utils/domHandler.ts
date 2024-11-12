/**
 #### `isElement` Function Documentation

 The `isElement` function is a utility function that checks if an object is a DOM element. It takes an `HTMLElement` object as a parameter and returns a boolean value indicating whether the object is a DOM element or not.

 ##### Syntax
 ```typescript
 export function isElement(obj: HTMLElement): boolean
 ```

 ##### Parameters
 - `obj`: The object to check if it is a DOM element.

 ##### Return Value
 - `true` if the object is an instance of `HTMLElement`.
 - `true` if the object is an object of type `HTMLElement` and has a `nodeType` property with a value of `1`.
 - `false` for all other cases.

 ##### Example Usage
 ```typescript
 const isElement = isElement(obj);
 ```
 */
export function isElement(obj: HTMLElement | any): boolean {
  return (
    obj instanceof HTMLElement ||
    (typeof obj === "object" && obj !== null && obj.nodeType === 1 && typeof obj.nodeName === "string")
  )
}

/**
 #### `getParentNode` Function Documentation

 The `getParentNode` function is a utility function that returns the parent node of a given HTML element. It takes an `HTMLElement` as a parameter and returns a `ParentNode`, `Element`, or `null` value.

 ##### Syntax
 ```typescript
 export function getParentNode(element: HTMLElement): ParentNode | Element | null
 ```

 ##### Parameters
 - `element`: The HTML element for which the parent node needs to be retrieved.

 ##### Return Value
 - If the parent node is a `ShadowRoot` and has a `host` property, the function returns the `host` element of the `ShadowRoot`.
 - If the parent node is a regular `Element`, the function returns the parent element.
 - If the parent node is a `Document` or `DocumentFragment`, the function returns `null`.
 - If the element does not have a parent node, the function also returns `null`.

 ##### Example Usage
 ```typescript
 const parent = getParentNode(element);
 ```
 */
export function getParentNode(element: HTMLElement): ParentNode | Element | null {
  let parent = element?.parentNode

  if (parent && parent instanceof ShadowRoot && parent.host) {
    parent = parent.host
  }

  return parent
}

/**
 #### `isExist` Function Documentation

 The `isExist` function is a utility function that checks if an HTML element exists in the DOM. It takes an `HTMLElement` as a parameter and returns a boolean value indicating whether the element exists or not.

 ##### Syntax
 ```typescript
 export function isExist(element: HTMLElement): boolean
 ```

 ##### Parameters
 - `element`: The HTML element to check for existence.

 ##### Return Value
 - `true` if the element exists in the DOM.
 - `false` if the element is `null`, `undefined`, or not attached to the DOM.

 ##### Example Usage
 ```typescript
 const exists = isExist(element);
 ```
 */
export function isExist(element: HTMLElement): boolean {
  return !!(element !== null && typeof element !== "undefined" && element.nodeName && getParentNode(element))
}

/**
 #### `isClient` Function Documentation

 The `isClient` function is a utility function that checks if the code is running in a client-side environment. It returns a boolean value indicating whether the code is executing in a browser environment.

 ##### Syntax
 ```typescript
 export function isClient(): boolean
 ```

 ##### Return Value
 - `true` if the code is running in a client-side environment.
 - `false` if the code is running in a non-browser environment or if the `window` object is not available.

 ##### Example Usage
 ```typescript
 const isClient = isClient();
 ```
 */
export function isClient(): boolean {
  return !!(typeof window !== "undefined" && window.document && window.document.createElement)
}

/**
 #### `setAttribute` Function Documentation

 The `setAttribute` function is a utility function that sets an attribute with a specified value on a given HTML element. It takes three parameters: the `element` on which the attribute needs to be set, the `attribute` name, and the `value` to be assigned to the attribute.

 ##### Syntax
 ```typescript
 export function setAttribute(element: HTMLElement, attribute = "", value: any): void
 ```

 ##### Parameters
 - `element`: The HTML element on which the attribute needs to be set.
 - `attribute`: The name of the attribute to be set. (Optional, default: "")
 - `value`: The value to be assigned to the attribute.

 ##### Return Value
 This function does not return any value (`void`).

 ##### Example Usage
 ```typescript
 setAttribute(element, "class", "my-class");
 ```
 */
export function setAttribute(element: HTMLElement, attribute = "", value: any): void {
  // if (isElement(element) && value !== null && value !== undefined) {
  //   element.setAttribute(attribute, value)
  // }
  if (isElement(element) && attribute && value !== null && value !== undefined) {
    try {
      element.setAttribute(attribute, value)
    } catch (error) {
      if (error instanceof DOMException && error.name === "InvalidCharacterError") {
        console.error("Invalid attribute name:", attribute)
      } else {
        throw error // Пробрасываем другие ошибки
      }
    }
  }
}

/**
 #### `setAttributes` Function Documentation

 The `setAttributes` function is a utility function that sets multiple attributes with their respective values on a given HTML element. It takes two parameters: the `element` on which the attributes need to be set, and an `attributes` object containing the attribute-value pairs.

 ##### Syntax
 ```typescript
 export function setAttributes(element: HTMLElement, attributes = {}): void
 ```

 ##### Parameters
 - `element`: The HTML element on which the attributes need to be set.
 - `attributes`: An object containing the attribute-value pairs. (Optional, default: {})

 ##### Return Value
 This function does not return any value (`void`).

 ##### Example Usage
 ```typescript
 setAttributes(element, { "class": "my-class", "data-id": 123 });
 ```
 */
export function setAttributes(element: HTMLElement, attributes = {}): void {
  if (isElement(element)) {
    const computedStyles = (rule: string, value: any) => {
      const styles = (element as any)?.$attrs?.[rule] ? [(element as any)?.$attrs?.[rule]] : []

      return [value].flat().reduce((cv, v) => {
        if (v !== null && v !== undefined) {
          const type = typeof v

          if (type === "string" || type === "number") {
            cv.push(v)
          } else if (type === "object") {
            const _cv = Array.isArray(v)
              ? computedStyles(rule, v)
              : Object.entries(v).map(([_k, _v]) =>
                  rule === "style" && (!!_v || _v === 0)
                    ? `${_k.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${_v}`
                    : _v
                      ? _k
                      : undefined
                )

            cv = _cv.length ? cv.concat(_cv.filter((c: any) => !!c)) : cv
          }
        }

        return cv
      }, styles)
    }

    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const matchedEvent = key.match(/^on(.+)/)

        if (matchedEvent) {
          element.addEventListener(matchedEvent[1].toLowerCase(), value as any)
        } else if (key === "p-bind") {
          setAttributes(element, value as object)
        } else {
          value =
            key === "class"
              ? [...(new Set(computedStyles("class", value)) as any)].join(" ").trim()
              : key === "style"
                ? computedStyles("style", value).join(";").trim()
                : value
          ;((element as any).$attrs = (element as any).$attrs || {}) && ((element as any).$attrs[key] = value)
          element.setAttribute(key, value as string)
        }
      }
    })
  }
}

/**
 #### `minifyCSS` Function Documentation

 The `minifyCSS` function is a utility function that minifies a CSS string by removing unnecessary characters and reducing file size. It takes a `css` string as input and returns the minified CSS string.

 ##### Syntax
 ```typescript
 export function minifyCSS(css: string): string
 ```

 ##### Parameters
 - `css`: The CSS string to be minified.

 ##### Return Value
 - The minified CSS string.

 ##### Example Usage
 ```typescript
 const minifiedCSS = minifyCSS(css);
 ```

 Please note that the provided implementation does not include any additional features such as handling media queries or optimizing selectors. It focuses on basic minification by removing comments, extra spaces, and reducing the size of the CSS file.
 */
export function minifyCSS(css: string | any): string {
  if (typeof css !== "string") {
    return "" // Возвращаем пустую строку для недопустимых типов данных
  }

  return css
    .replace(/\/\*[\s\S]*?\*\//g, "") // Удаление комментариев
    .replace(/[\r\n\t]+/g, "") // Удаление переносов строк и табуляций
    .replace(/ {2,}/g, " ") // Замена двух и более пробелов на один
    .replace(/ ([{:}]) /g, "$1") // Удаление пробелов вокруг специальных символов
    .replace(/([;,]) /g, "$1") // Удаление пробела после запятой или точки с запятой
    .replace(/ !/g, "!") // Удаление пробела перед !important
    .replace(/: /g, ":") // Удаление пробела после двоеточия
    .trim() // Удаление начальных и конечных пробелов
}

export function getParentElements(element: HTMLElement): HTMLElement[] {
  const parents: HTMLElement[] = []
  let currentElement = element

  while (currentElement.parentElement) {
    parents.push(currentElement.parentElement)
    currentElement = currentElement.parentElement
  }

  return parents
}
