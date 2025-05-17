# FishtVue Nuxt Sandbox

This sandbox provides a minimal Nuxt 3 setup to help you experiment with and develop FishtVue UI components in a real Nuxt environment. Use it as a playground or as a reference for integrating FishtVue into your Nuxt projects.

## Features

- Installs and configures the `fishtvue` UI library as a Nuxt module
- Ready-to-use Tailwind CSS integration
- Example page to showcase FishtVue components
- Supports latest Nuxt 3 features

## Getting Started

### 1. Install Dependencies

You can use your favorite package manager:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

### 2. Run the Development Server

Start the Nuxt development server. The app will be available at `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

### 3. Build for Production

Build the application for production deployment:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

### 4. Preview the Production Build

You can preview the optimized production build locally:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

For more information on deploying your Nuxt app, see the [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment).

## How to Use FishtVue in Nuxt

The sandbox is already configured to use the FishtVue library via the Nuxt module system. See the relevant section of `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['fishtvue/module'],
  css: ['~/assets/css/main.css'],
  // other config...
})
```

This ensures all FishtVue components and styles are available globally in your Nuxt app.

You can now use FishtVue components anywhere in your project. For example, try editing `app.vue` or adding new pages/components to experiment with FishtVue UI elements.

## Customization

- **Tailwind CSS**: Tailwind is included via Vite plugin and configured in `main.css`. Feel free to adjust styles as needed.
- **FishtVue**: If you are developing FishtVue locally, you may want to uncomment and adapt the alias in the Vite config for local development.

## Learn More

- [FishtVue repository](https://github.com/Egoka/FishtVue)
- [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction)
- [Tailwind CSS documentation](https://tailwindcss.com/docs/installation)

---

**Happy coding with FishtVue and Nuxt!**