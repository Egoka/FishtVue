import "./assets/main.css"

import { createApp } from "vue"
import { createPinia } from "pinia"
import FishtVue from "fishtvue/config"

import App from "./App.vue"
import router from "./router"
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(FishtVue, {
  optionsTheme: {
    // isNotMinifyCSS: true,
    // darkModeSelector: "html.dark"
  }
})

app.mount("#app")
