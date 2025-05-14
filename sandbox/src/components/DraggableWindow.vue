<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from "vue"

  interface Props {
    title?: string
    initialX?: number
    initialY?: number
    zIndex?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    title: "Перетаскиваемое окно",
    initialX: 100,
    initialY: 100,
    zIndex: 50
  })

  const emit = defineEmits<{
    move: [x: number, y: number]
  }>()

  // Позиция окна
  const posX = ref(props.initialX)
  const posY = ref(props.initialY)
  const isDragging = ref(false)
  const startX = ref(0)
  const startY = ref(0)
  const windowRef = ref<HTMLElement | null>(null)

  // Обработчики событий для перетаскивания
  function startDrag(event: MouseEvent) {
    if (!windowRef.value) return

    isDragging.value = true
    startX.value = event.clientX - posX.value
    startY.value = event.clientY - posY.value

    document.addEventListener("mousemove", onDrag)
    document.addEventListener("mouseup", stopDrag)
  }

  function onDrag(event: MouseEvent) {
    if (!isDragging.value) return

    posX.value = event.clientX - startX.value
    posY.value = event.clientY - startY.value

    // Предотвращаем выход за пределы окна браузера
    if (posX.value < 0) posX.value = 0
    if (posY.value < 0) posY.value = 0

    const maxX = window.innerWidth - (windowRef.value?.offsetWidth || 0)
    const maxY = window.innerHeight - (windowRef.value?.offsetHeight || 0)

    if (posX.value > maxX) posX.value = maxX
    if (posY.value > maxY) posY.value = maxY

    emit("move", posX.value, posY.value)
  }

  function stopDrag() {
    isDragging.value = false
    document.removeEventListener("mousemove", onDrag)
    document.removeEventListener("mouseup", stopDrag)
  }

  onMounted(() => {
    // Предотвращаем выход за границы экрана при инициализации
    if (posX.value < 0) posX.value = 0
    if (posY.value < 0) posY.value = 0
  })

  onUnmounted(() => {
    document.removeEventListener("mousemove", onDrag)
    document.removeEventListener("mouseup", stopDrag)
  })

  defineExpose({
    posX,
    posY,
    isDragging
  })
</script>

<template>
  <div
    ref="windowRef"
    class="draggable-window shadow-lg rounded-md bg-white dark:bg-neutral-800"
    :style="{
      position: 'fixed',
      left: `${posX}px`,
      top: `${posY}px`,
      zIndex: props.zIndex,
      border: '1px solid',
      borderColor: 'rgb(229 231 235 / 1)',
      maxWidth: '90vw',
      maxHeight: '90vh',
      overflow: 'auto'
    }">
    <div
      class="drag-handle px-4 py-2 cursor-move bg-neutral-100 dark:bg-neutral-700 flex items-center justify-between rounded-t-md border-b border-neutral-200 dark:border-neutral-600"
      @mousedown="startDrag"
      @touchstart.prevent="startDrag">
      <div class="text-sm font-medium">{{ props.title }}</div>
      <div class="flex gap-1">
        <div class="drag-handle-icon size-3 rounded-full bg-red-400"></div>
        <div class="drag-handle-icon size-3 rounded-full bg-yellow-400"></div>
        <div class="drag-handle-icon size-3 rounded-full bg-green-400"></div>
      </div>
    </div>
    <div class="window-content p-4">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
  .draggable-window {
    transition: box-shadow 0.2s ease-in-out;
  }

  .draggable-window:hover {
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  .drag-handle {
    touch-action: none;
    user-select: none;
  }
</style>
