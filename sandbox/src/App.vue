<script setup lang="ts">
  import { useScrollTo } from "@/composables/useScrollTo"
  import AppLogo from "@/components/Logo.vue"
  import DocComponent from "@/components/doc/Component.vue"
  import Doc039 from "@/components/doc/039.vue"
  import DemoInput from "@/components/demo/Input.vue"
  import DemoSelect from "@/components/demo/Select.vue"
  import DemoCalendar from "@/components/demo/Calendar.vue"
  import DemoSwitch from "@/components/demo/Switch.vue"
  import DemoAria from "@/components/demo/Aria.vue"
  import DemoForm from "@/components/demo/Form.vue"
  import DemoButton from "@/components/demo/Button.vue"
  import DemoTable from "@/components/demo/Table.vue"
  import DemoPagination from "@/components/demo/Pagination.vue"
  import DemoAccordion from "@/components/demo/Accordion.vue"
  import DemoSplit from "@/components/demo/Split.vue"
  import DemoSeparator from "@/components/demo/Separator.vue"
  import DemoDialog from "@/components/demo/Dialog.vue"
  import DemoFixWindow from "@/components/demo/FixWindow.vue"
  import DemoMenu from "@/components/demo/Menu.vue"
  import DemoAlert from "@/components/demo/Alert.vue"
  import DemoBadge from "@/components/demo/Badge.vue"
  import DemoLoading from "@/components/demo/Loading.vue"

  const { scrollToPosition } = useScrollTo()
</script>
<template>
  <div class="w-full h-full grow">
    <div class="w-full">
      <div
        class="-z-1 w-full h-max absolute top-0 left-0 inset-0 pointer-events-none flex justify-center overflow-hidden">
        <div class="w-[108rem] flex-none flex justify-end h-screen">
          <div
            class="fixed z-1 rounded-full bg-theme-600 dark:bg-theme-800 blur-[300px] size-60 sm:size-80 transform -translate-x-1/2 left-0 -translate-y-80">
            <div
              class="absolute z-1 rounded-full bg-theme-600 dark:bg-theme-800 blur-[300px] size-60 sm:size-80 transform -translate-x-1/2 left-0 -translate-y-80"></div>
          </div>
          <Doc039 />
        </div>
      </div>
      <main>
        <div
          class="max-w-[950px] mx-auto w-full h-full grow p-10 min-h-screen flex flex-col items-center justify-center text-gray-600">
          <div class="text-center my-[35vh]">
            <h1
              class="font-asap sm:leading-22 text-center text-4xl font-bold sm:text-6xl sm:font-extrabold md:text-7xl text-foreground text-stone-800 dark:text-neutral-300">
              Welcome to the sandbox <br /><span class="font-asap text-theme-900 dark:text-theme-300">FishtVue</span>
            </h1>
            <p class="text-xl mb-8">Your new favorite UI library for Vue.js</p>
            <button
              class="bg-white dark:bg-neutral-800 text-theme-600 dark:text font-bold py-2 px-4 rounded-lg hover:bg-gray-100 hover:dark:bg-gray-900 transition duration-300"
              @click="scrollToPosition(800)">
              Get Started
            </button>
          </div>
          <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-white dark:bg-neutral-800 text-gray-800 dark:text-gray-300 p-6 rounded-lg shadow-lg">
              <h2 class="text-2xl font-bold mb-4">Simplicity</h2>
              <p>Intuitive components that are easy to use and customize.</p>
            </div>
            <div class="bg-white dark:bg-neutral-800 text-gray-800 dark:text-gray-300 p-6 rounded-lg shadow-lg">
              <h2 class="text-2xl font-bold mb-4">Flexibility</h2>
              <p>Adapt components to your needs with minimal effort.</p>
            </div>
            <div class="bg-white dark:bg-neutral-800 text-gray-800 dark:text-gray-300 p-6 rounded-lg shadow-lg">
              <h2 class="text-2xl font-bold mb-4">Performance</h2>
              <p>Optimized components for maximum performance.</p>
            </div>
          </div>
          <div class="mt-8 space-y-12 w-full">
            <h2
              id="form"
              class="scroll-mt-[180px] lg:scroll-mt-[141px] font-asap tracking-wide font-semibold mb-2.5 text-3xl mt-12 ml-6 text-neutral-700 dark:text-neutral-200">
              <a href="#form" class="group"> Form </a>
            </h2>
            <p class="my-5 leading-7 text-pretty text-neutral-700 dark:text-neutral-400 mt-4">
              Components for building and managing forms, including input controls, selection, layout, and
              accessibility.
            </p>
            <div class="px-2 md:px-18 pb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DocComponent
                title="Layout"
                subtitle="A wrapper component used to render labels, validation, and layout structure for form inputs. Commonly used internally by input-related components to ensure consistent styling and behavior."
                link="/components/form/layout">
              </DocComponent>
              <DocComponent
                title="Input"
                subtitle="Standard text input field with additional features like validation and masking."
                link="/components/form/input">
                <DemoInput />
              </DocComponent>
              <DocComponent
                title="Select"
                subtitle="Dropdown select component with support for multiple selection and custom options."
                link="/components/form/select">
                <DemoSelect />
              </DocComponent>
              <DocComponent
                title="Calendar"
                subtitle="Date and time picker component with various modes."
                link="/components/form/calendar">
                <DemoCalendar />
              </DocComponent>
              <DocComponent
                title="Switch"
                subtitle="Toggle component for binary input with accessibility features."
                link="/components/form/switch">
                <DemoSwitch />
              </DocComponent>
              <DocComponent
                title="Aria"
                subtitle="Utility component to assist with ARIA attributes for form accessibility.  "
                link="/components/form/aria">
                <DemoAria />
              </DocComponent>
              <DocComponent
                title="Form"
                subtitle="A powerful and flexible form container component designed to manage the structure, validation, and submission of form elements. It provides a unified interface for working with form inputs, integrates with validation libraries, and supports scoped slots for custom layout and field rendering. The Form component ensures consistency across form elements and simplifies the process of building complex, interactive forms."
                link="/components/form/form"
                class="sm:col-span-2">
                <DemoForm />
              </DocComponent>
            </div>
          </div>
          <div class="mt-8 space-y-12 w-full">
            <h2
              id="form"
              class="scroll-mt-[180px] lg:scroll-mt-[141px] font-asap tracking-wide font-semibold mb-2.5 text-3xl mt-12 ml-6 text-neutral-700 dark:text-neutral-200">
              <a href="#form" class="group"> Button </a>
            </h2>
            <p class="my-5 leading-7 text-pretty text-neutral-700 dark:text-neutral-400 mt-4">
              Interactive action components.
            </p>
            <div class="px-2 md:px-18 pb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DocComponent
                title="Button"
                subtitle="Versatile button component with multiple styling options and states."
                link="/components/button/button"
                class="sm:col-span-2">
                <DemoButton />
              </DocComponent>
            </div>
          </div>
          <!-- Data Section -->
          <div class="mt-8 space-y-12 w-full">
            <h2
              id="data"
              class="scroll-mt-[180px] lg:scroll-mt-[141px] font-asap tracking-wide font-semibold mb-2.5 text-3xl mt-12 ml-6 text-neutral-700 dark:text-neutral-200">
              <a href="#data" class="group"> Data </a>
            </h2>
            <p class="my-5 leading-7 text-pretty text-neutral-700 dark:text-neutral-400 mt-4">
              Components for displaying and navigating through structured data.
            </p>
            <div class="px-2 md:px-18 pb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DocComponent
                title="Table"
                subtitle="A flexible data table component with support for sorting, filtering, pagination, and custom cell content. Designed for responsive layouts and interactive data display."
                link="/components/data/table"
                class="sm:col-span-2">
                <DemoTable />
              </DocComponent>
              <DocComponent
                title="Pagination"
                subtitle="Component for paginating large datasets with navigation controls."
                link="/components/data/pagination"
                class="sm:col-span-2">
                <DemoPagination />
              </DocComponent>
            </div>
          </div>

          <!-- Panel Section -->
          <div class="mt-8 space-y-12 w-full">
            <h2
              id="panel"
              class="scroll-mt-[180px] lg:scroll-mt-[141px] font-asap tracking-wide font-semibold mb-2.5 text-3xl mt-12 ml-6 text-neutral-700 dark:text-neutral-200">
              <a href="#panel" class="group"> Panel </a>
            </h2>
            <p class="my-5 leading-7 text-pretty text-neutral-700 dark:text-neutral-400 mt-4">
              Layout containers and visual separation components.
            </p>
            <div class="px-2 md:px-18 pb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DocComponent
                title="Accordion"
                subtitle="Expandable sections to show or hide content interactively."
                link="/components/panel/accordion">
                <DemoAccordion />
              </DocComponent>
              <DocComponent
                title="Split"
                subtitle="Split view layout component for resizable panels."
                link="/components/panel/split">
                <DemoSplit />
              </DocComponent>
              <DocComponent
                title="Separator"
                subtitle="Visual divider for separating content areas."
                link="/components/panel/separator"
                class="sm:col-span-2">
                <DemoSeparator />
              </DocComponent>
            </div>
          </div>

          <!-- Overlay Section -->
          <div class="mt-8 space-y-12 w-full">
            <h2
              id="overlay"
              class="scroll-mt-[180px] lg:scroll-mt-[141px] font-asap tracking-wide font-semibold mb-2.5 text-3xl mt-12 ml-6 text-neutral-700 dark:text-neutral-200">
              <a href="#overlay" class="group"> Overlay </a>
            </h2>
            <p class="my-5 leading-7 text-pretty text-neutral-700 dark:text-neutral-400 mt-4">
              Modal and floating window components that appear above other content.
            </p>
            <div class="px-2 md:px-18 pb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DocComponent
                title="Dialog"
                subtitle="Modal dialog component for confirmations, messages, and embedded forms."
                link="/components/overlay/dialog">
                <DemoDialog class="mt-8" />
              </DocComponent>
              <DocComponent
                title="Fix window"
                subtitle="Fixed position window that remains on screen regardless of scroll."
                link="/components/overlay/fixwindow">
                <DemoFixWindow />
              </DocComponent>
            </div>
          </div>

          <!-- Menu Section -->
          <div class="mt-8 space-y-12 w-full">
            <h2
              id="menu"
              class="scroll-mt-[180px] lg:scroll-mt-[141px] font-asap tracking-wide font-semibold mb-2.5 text-3xl mt-12 ml-6 text-neutral-700 dark:text-neutral-200">
              <a href="#menu" class="group"> Menu </a>
            </h2>
            <p class="my-5 leading-7 text-pretty text-neutral-700 dark:text-neutral-400 mt-4">
              Navigation and dropdown menu components.
            </p>
            <div class="px-2 md:px-18 pb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DocComponent
                title="Menu"
                subtitle="Dropdown menu with nested submenu support and keyboard navigation."
                link="/components/menu/menu"
                class="sm:col-span-2">
                <DemoMenu />
              </DocComponent>
            </div>
          </div>

          <!-- Messages Section -->
          <div class="mt-8 space-y-12 w-full">
            <h2
              id="messages"
              class="scroll-mt-[180px] lg:scroll-mt-[141px] font-asap tracking-wide font-semibold mb-2.5 text-3xl mt-12 ml-6 text-neutral-700 dark:text-neutral-200">
              <a href="#messages" class="group"> Messages </a>
            </h2>
            <p class="my-5 leading-7 text-pretty text-neutral-700 dark:text-neutral-400 mt-4">
              Components for displaying notifications and status messages.
            </p>
            <div class="px-2 md:px-18 pb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DocComponent
                title="Alert"
                subtitle="Displays alerts, warnings, and success/error messages."
                link="/components/messages/alert"
                class="sm:col-span-2">
                <DemoAlert />
              </DocComponent>
            </div>
          </div>

          <!-- Misc Section -->
          <div class="mt-8 space-y-12 w-full">
            <h2
              id="misc"
              class="scroll-mt-[180px] lg:scroll-mt-[141px] font-asap tracking-wide font-semibold mb-2.5 text-3xl mt-12 ml-6 text-neutral-700 dark:text-neutral-200">
              <a href="#misc" class="group"> Misc </a>
            </h2>
            <p class="my-5 leading-7 text-pretty text-neutral-700 dark:text-neutral-400 mt-4">
              Various utility components that enhance the user interface.
            </p>
            <div class="px-2 md:px-18 pb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DocComponent
                title="Badge"
                subtitle="Status label used to show counts, states, or categories."
                link="/components/misc/badge">
                <DemoBadge class="mt-8" />
              </DocComponent>
              <DocComponent
                title="Loading"
                subtitle="Loading spinner to indicate asynchronous actions or pending state."
                link="/components/misc/loading">
                <DemoLoading />
              </DocComponent>
              <DocComponent
                title="Icons"
                subtitle="Icon system supporting multiple icon packs and dynamic rendering."
                link="/components/misc/icons"
                class="sm:col-span-2">
              </DocComponent>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
  <footer class="w-screen px-8 md:px-28 py-8 max-w-screen-xl mx-auto justify-center sm:justify-end flex">
    <div class="flex text-neutral-500 dark:text-neutral-400 text-xs">
      <AppLogo class="size-4 fill-neutral-500 dark:fill-neutral-400 mr-2" />
      <div>
        © 2025 <strong>FishtVue</strong> by
        <a href="/" target="_blank" rel="noopener noreferrer">Egoka</a>
      </div>
    </div>
  </footer>
</template>
