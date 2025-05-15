<script setup lang="ts">
  import { useEventListener } from "@vueuse/core"
  import type { P5I } from "p5i"
  import { p5i } from "p5i"
  import { onMounted, onUnmounted, ref } from "vue"
  const colorMode = useColorMode()
  const el = ref<HTMLCanvasElement | null>(null)
  const isVisible = ref(false)

  const {
    mount,
    unmount,
    createCanvas,
    background,
    noFill,
    stroke,
    noise,
    noiseSeed,
    resizeCanvas,
    cos,
    sin,
    TWO_PI,
    frameRate
  } = p5i()

  let w = window.innerWidth
  let h = window.innerHeight
  let offsetY = window.scrollY
  let mouseX = 0
  let mouseY = 0

  const SCALE = 200
  const LENGTH = 10
  const SPACING = 22
  const GLOW_DISTANCE = 50

  function getForceOnPoint(x: number, y: number, z: number) {
    return (noise(x / SCALE, y / SCALE, z) - 0.5) * 2 * TWO_PI
  }

  const existingPoints = new Set<string>()
  const points: { x: number; y: number; opacity: number }[] = []

  function addPoints() {
    const visibleHeight = h
    const startY = offsetY - SPACING
    const endY = offsetY + visibleHeight + SPACING

    for (let x = -SPACING / 2; x < w + SPACING; x += SPACING) {
      for (let y = startY; y < endY; y += SPACING) {
        const id = `${Math.round(x / SPACING)}-${Math.round(y / SPACING)}`
        if (existingPoints.has(id)) continue
        existingPoints.add(id)
        points.push({ x, y, opacity: Math.random() * 0.5 + 0.5 })
      }
    }
  }

  function setup() {
    createCanvas(w, h)
    frameRate(30)
    stroke("#ccc")
    noFill()
    noiseSeed(+new Date())
    addPoints()
  }

  function draw({ circle }: P5I) {
    background(colorMode.value === "light" ? "#f5f5f5" : "#171717")
    const t = +new Date() / 10000

    const visiblePoints = points.filter((p) => p.y >= offsetY - GLOW_DISTANCE && p.y <= offsetY + h + GLOW_DISTANCE)

    for (const p of visiblePoints) {
      const { x, y } = p
      const rad = getForceOnPoint(x, y, t)
      const noiseValue = noise(x / SCALE, y / SCALE, t * 2)
      const length = (noiseValue + 0.5) * LENGTH
      const nx = x + cos(rad) * length
      const ny = y + sin(rad) * length

      const mouseCheckRadius = GLOW_DISTANCE * 2
      const alpha = (Math.abs(cos(rad)) * 0.5 + 0.5) * p.opacity * 255

      if (Math.abs(nx - mouseX) < mouseCheckRadius && Math.abs(ny - offsetY - mouseY) < mouseCheckRadius) {
        const distToMouse = Math.sqrt((nx - mouseX) ** 2 + (ny - offsetY - mouseY) ** 2)
        if (distToMouse < GLOW_DISTANCE) {
          if (colorMode.value === "light") stroke(0, 130, 0, alpha)
          else stroke(130, 200, 160, alpha)
        } else {
          if (colorMode.value === "light") stroke(130, 185, 165, alpha)
          else stroke(15, 55, 30, alpha)
        }
      } else {
        if (colorMode.value === "light") stroke(130, 185, 165, alpha)
        else stroke(15, 55, 30, alpha)
      }

      circle(nx, ny - offsetY, 1)
    }
  }

  function restart() {
    if (el.value) mount(el.value, { setup, draw })
  }

  onMounted(() => {
    restart()
    setTimeout(() => {
      isVisible.value = true
    }, 50)

    useEventListener("mousemove", (event) => {
      mouseX = event.clientX
      mouseY = event.clientY
    })

    useEventListener("resize", () => {
      w = window.innerWidth
      h = window.innerHeight
      resizeCanvas(w, h)
      addPoints()
    })

    useEventListener("scroll", () => {
      offsetY = window.scrollY
      addPoints() // Обновляем точки при скролле
    })
  })

  onUnmounted(() => {
    unmount()
  })
</script>

<template>
  <div
    ref="el"
    class="pointer-events-none fixed bottom-0 left-0 right-0 top-0 -z-1 fade-canvas"
    :class="{ visible: isVisible }" />
</template>

<style scoped>
  .fade-canvas {
    opacity: 0;
    transition: opacity 1s ease-in;
  }
  .fade-canvas.visible {
    opacity: 1;
  }
</style>
