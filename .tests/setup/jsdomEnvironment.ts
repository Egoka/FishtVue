import { VirtualConsole } from "jsdom"
import { builtinEnvironments, type Environment } from "vitest/environments"

const jsdomEnvironment = builtinEnvironments.jsdom

// jsdom (rrweb-cssom) не умеет парсить @layer (CSS Cascade Layers), в который
// lib/component/index.ts и lib/config/index.ts всегда оборачивают стили компонентов
// (Wave 2, Issue 4) — валидная browser-фича, которую парсер jsdom просто не поддерживает.
// На каждой вставке <style> это кидает jsdomError "Could not parse CSS stylesheet": на CI —
// тысячи exceptions за прогон и заметная просадка suite вплоть до флаки-таймаутов в других
// файлах. Патчить console.error из setupTests.ts бесполезно — jsdom конструирует окно (и
// привязывает virtualConsole к console) раньше, чем Vitest подменяет глобальный console для
// перехвата test-логов, поэтому патч бьёт мимо. Подменяем virtualConsole прямо на этапе
// конструирования jsdom-окружения — единственная точка, где это ещё возможно.
function createVirtualConsole(): VirtualConsole {
  const virtualConsole = new VirtualConsole()
  virtualConsole.sendTo(console, { omitJSDOMErrors: true })
  virtualConsole.on("jsdomError", (error: Error & { type?: string }) => {
    if (error.type !== "css parsing") console.error(error)
  })
  return virtualConsole
}

const environment: Environment = {
  ...jsdomEnvironment,
  setup: (global, options) =>
    jsdomEnvironment.setup(global, {
      ...options,
      jsdom: { ...options.jsdom, virtualConsole: createVirtualConsole() }
    }),
  setupVM: (options) =>
    jsdomEnvironment.setupVM!({
      ...options,
      jsdom: { ...options.jsdom, virtualConsole: createVirtualConsole() }
    })
}

export default environment
