<template>
  <div class="max-w-[1440px] w-full h-full grow">
    <div class="w-full">
      <div
        class="-z-1 w-full h-max absolute top-0 left-0 inset-0 pointer-events-none flex justify-center overflow-hidden">
        <div class="w-[108rem] flex-none flex justify-end h-screen">
          <div
            class="fixed z-1 rounded-full bg-theme-600 dark:bg-theme-800 blur-[300px] size-60 sm:size-80 transform -translate-x-1/2 left-0 -translate-y-80">
            <div
              class="absolute z-1 rounded-full bg-theme-600 dark:bg-theme-800 blur-[300px] size-60 sm:size-80 transform -translate-x-1/2 left-0 -translate-y-80"></div>
          </div>
          <ClientOnly>
            <Doc039 />
          </ClientOnly>
        </div>
      </div>
      <main>
        <slot />
      </main>
    </div>
  </div>
  <AppFooter />
</template>
