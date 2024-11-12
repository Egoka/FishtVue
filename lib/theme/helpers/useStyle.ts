import { Style, StyleOptions } from "fishtvue/theme/Theme"
import { nextTick, readonly, ref, watch } from "vue"
import { isClient, isExist, setAttribute, setAttributes } from "fishtvue/utils/domHandler"

let _id = 0

/**
 * Inject <style> element in head.
 *
 * Ported from useStyleTag in [@vueuse/core](https://github.com/vueuse)
 * @param css
 * @param options
 */
export default (css: string, options: StyleOptions = {}): Style => {
  const isLoaded = ref(false)
  const cssRef = ref(css)
  const styleRef = ref<HTMLElement>()

  const defaultDocument = isClient() ? window.document : undefined
  const {
    document = defaultDocument,
    immediate = true,
    manual = false,
    name = `style_${++_id}`,
    id = undefined,
    media = undefined,
    nonce = undefined,
    first = false,
    onMounted: onStyleMounted = undefined,
    onUpdated: onStyleUpdated = undefined,
    onLoad: onStyleLoaded = undefined,
    props = {}
  } = options

  let stop = () => {}

  const load = (_css?: string, _props = {}) => {
    if (!document) return

    const _styleProps = { ...props, ..._props }
    const [_name, _id, _nonce] = [_styleProps.name || name, _styleProps.id || id, _styleProps.nonce || nonce]

    styleRef.value = (document.querySelector(`style[data-fishtvue-style-id="${_name}"]`) ||
      (document as Document).getElementById(_id) ||
      (document as Document).createElement("style")) as HTMLElement

    if (styleRef.value) {
      cssRef.value = _css || css

      setAttributes(styleRef.value, {
        type: "text/css",
        id: _id,
        media,
        nonce: _nonce
      })
      first
        ? (document as Document).head.prepend(styleRef.value)
        : (document as Document).head.appendChild(styleRef.value)
      setAttribute(styleRef.value, "data-fishtvue-style-id", _name)
      setAttributes(styleRef.value, _styleProps)
      styleRef.value.onload = (event) => onStyleLoaded?.(event, { name: _name })
      onStyleMounted?.(_name)
    }

    if (isLoaded.value) return

    stop = watch(
      cssRef,
      (value) => {
        if (styleRef.value) styleRef.value.textContent = value
        onStyleUpdated?.(_name)
      },
      { immediate: true }
    )

    isLoaded.value = true
  }

  const unload = () => {
    if (!document || !isLoaded.value) return
    stop()
    if (styleRef.value) isExist(styleRef.value) && (document as Document).head.removeChild(styleRef.value)
    isLoaded.value = false
  }
  function tryOnMounted(fn: () => void, sync = true) {
    if (sync) fn()
    else nextTick(fn).then()
  }
  if (immediate && !manual) tryOnMounted(load)
  return {
    id,
    name,
    el: styleRef,
    css: cssRef,
    unload,
    load,
    isLoaded: readonly(isLoaded)
  }
}
