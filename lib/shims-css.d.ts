// Ambient-декларация для CSS-модулей. Нужна с Wave 2.1: Calendar/TextEditor грузят стили
// тяжёлых optional-peer'ов (v-calendar, @vueup/vue-quill) через ДИНАМИЧЕСКИЙ import() в onMounted
// (lazy, SSR-safe). В отличие от eager side-effect-импорта ("x.css", которому тип не нужен),
// dynamic import — это выражение Promise<typeof import("x.css")>, поэтому vue-tsc
// (moduleResolution: node, без vite/client в "types") требует тип модуля. Объявляем "*.css" как
// пустой модуль. Файл вне per-component d.ts — copyDependencies его не публикует (инертен).
declare module "*.css"
