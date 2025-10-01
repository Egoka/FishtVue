export const useScrollTo = () => {
  const scrollToPosition = (pixels: number) => {
    //@ts-ignore
    if (process?.client) {
      window.scrollTo({
        top: window.scrollY + pixels,
        behavior: "smooth"
      })
    }
  }

  return { scrollToPosition }
}
