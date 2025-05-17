export const useScrollTo = () => {
  const scrollToPosition = (pixels) => {
    if (process.client) {
      window.scrollTo({
        top: window.scrollY + pixels,
        behavior: "smooth"
      })
    }
  }

  return { scrollToPosition }
}
