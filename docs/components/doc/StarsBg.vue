<script setup lang="ts">
  interface Star {
    x: number
    y: number
    size: number
  }

  const props = withDefaults(
    defineProps<{
      starCount?: number
      color?: string
      speed?: "slow" | "normal" | "fast"
      size?: { min: number; max: number }
    }>(),
    {
      starCount: 900,
      color: "var(--color-theme-500)",
      speed: "normal",
      size: () => ({ min: 1, max: 3 })
    }
  )

  const getRandomSize = (min: number, max: number) => Math.random() * (max - min) + min

  const generateStars = (count: number, minSize: number, maxSize: number): Star[] => {
    return Array.from({ length: count }, () => ({
      x: Math.floor(Math.random() * 2000),
      y: Math.floor(Math.random() * 2000),
      size: getRandomSize(minSize, maxSize)
    }))
  }

  const speedConfigs = [
    { key: "slow", duration: 200, opacity: 0.5, ratio: 0.3 },
    { key: "normal", duration: 150, opacity: 0.75, ratio: 0.3 },
    { key: "fast", duration: 100, opacity: 1, ratio: 0.4 }
  ] as const

  const stars = useState("stars", () => {
    const { min, max } = props.size
    return Object.fromEntries(
      speedConfigs.map(({ key, ratio }) => [key, generateStars(Math.floor(props.starCount * ratio), min, max)])
    ) as Record<string, Star[]>
  })

  const starLayers = computed(() =>
    speedConfigs.map((config) => ({
      ...config,
      stars: stars.value[config.key]
    }))
  )
</script>

<template>
  <div class="absolute pointer-events-none z-[-1] inset-y-0 inset-x-5 sm:inset-x-7 lg:inset-x-9 overflow-hidden">
    <div class="stars size-full absolute inset-x-0 top-0">
      <div
        v-for="(layer, index) in starLayers"
        :key="index"
        class="star-layer"
        :style="{
          '--star-duration': `${layer.duration}s`,
          '--star-opacity': layer.opacity,
          '--star-color': color
        }">
        <div
          v-for="(star, starIndex) in layer.stars"
          :key="starIndex"
          class="star"
          :style="{
            '--x': `${star.x}px`,
            '--y': `${star.y}px`,
            '--size': `${star.size}px`
          }" />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .stars {
    left: 50%;
    transform: translate(-50%);
    -webkit-mask-image: linear-gradient(
      180deg,
      rgba(217, 217, 217, 0) 0%,
      rgba(217, 217, 217, 0.8) 25%,
      #d9d9d9 50%,
      rgba(217, 217, 217, 0.8) 75%,
      rgba(217, 217, 217, 0) 100%
    );
    mask-image: linear-gradient(
      180deg,
      rgba(217, 217, 217, 0) 0%,
      rgba(217, 217, 217, 0.8) 25%,
      #d9d9d9 50%,
      rgba(217, 217, 217, 0.8) 75%,
      rgba(217, 217, 217, 0) 100%
    );
    -webkit-mask-size: cover;
    mask-size: cover;
  }

  .star-layer {
    animation: risingStarsAnimation linear infinite;
    animation-duration: var(--star-duration);
    will-change: transform;
  }

  .star {
    position: absolute;
    left: var(--x);
    top: var(--y);
    width: var(--size);
    height: var(--size);
    background-color: var(--star-color);
    opacity: var(--star-opacity);
    border-radius: 9999px;
  }

  @keyframes risingStarsAnimation {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(-2000px);
    }
  }
</style>
