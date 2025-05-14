export function useSearchHotkeys(isOpen: Ref<boolean>) {
  const handleKeyCombo = (event: KeyboardEvent) => {
    const isMac = navigator.platform.toLowerCase().includes("mac")
    const isModifierPressed = isMac ? event.metaKey : event.ctrlKey

    if (isModifierPressed && event.key.toLowerCase() === "k" && !event.altKey && !event.shiftKey) {
      event.preventDefault()
      isOpen.value = true
    }
    if (event.key === "Escape" && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey) {
      event.preventDefault()
      isOpen.value = false
    }
  }

  onMounted(() => {
    document.addEventListener("keydown", handleKeyCombo)
  })

  onUnmounted(() => {
    document.removeEventListener("keydown", handleKeyCombo)
  })
}
