/**
 #### `isElement` Function Documentation

 The `isElement` function is a utility function that checks if an object is a DOM element. It takes an `HTMLElement` object as a parameter and returns a boolean value indicating whether the object is a DOM element or not.

 ##### Syntax
 ```typescript
 export function isElement(obj: HTMLElement|any): boolean
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
export declare function isElement(obj: HTMLElement | any): boolean

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
export declare function getParentNode(element: HTMLElement): ParentNode | Element | null

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
export declare function isClient(): boolean

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
export declare function setAttribute(element: HTMLElement, attribute: string, value: any): void

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
export declare function setAttributes(element: HTMLElement, attributes: object): void

/**
 #### `minifyCSS` Function Documentation

 The `minifyCSS` function is a utility function that minifies a CSS string by removing unnecessary characters and reducing file size. It takes a `css` string as input and returns the minified CSS string.

 ##### Syntax
 ```typescript
 export function minifyCSS(css: string | any): string
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
export declare function minifyCSS(css: string | any): string
