// import {version} from './package.json'
// import {discord, github, legacyLink, legacyVersion, releases,} from './meta'
import type { AppConfigInput } from "@nuxt/schema"

export type AppNuxtConfig = {
  site: {
    title: string
    logo: Record<"light" | "dark", string>
    nav: ({ text: string; link: string } | { text: string; items: { text: string; link: string }[] })[]
  }
} & AppConfigInput

export interface TocLink {
  id: string
  text: string
  depth: number
  children?: TocLink[]
}

export default defineAppConfig({
  site: {
    title: "Fisht",
    github: "https://github.com/Egoka/FishtVue",
    logo: {
      light: "/logo-light.svg",
      dark: "/logo-dark.svg"
    },
    nav: [
      { text: "Docs", link: "/docs/overview/getting-started" },
      { text: "Examples", link: "/examples/checkbox-group" },
      { text: "Showcase", link: "/showcase" }
      // {
      //     text: `v${version}`,
      //     items: [
      //         {text: 'Release Notes ', link: releases},
      //         {text: legacyVersion, link: legacyLink},
      //     ],
      // },
    ],
    editLink: "https://github.com/Egoka/FishtVue/docs/content/:path",
    publisherLink: "https://github.com/Egoka"
  },
  theme: {
    socialLinks: [{ icon: "github", link: "https://github.com/Egoka/FishtVue" }]
  },
  seo: {
    siteName: "Fisht Vue - Docs"
  },
  header: {},
  footer: {}
})
