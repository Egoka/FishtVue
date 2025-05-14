<template>
  <Pagination :total="120" :modelValue="1" :sizePage="10" />
  <Pagination :total="300" :modelValue="3" :visibleNumberPages="7" />
  <Pagination :isInfoText="true" :modelValue="1" :sizePage="20" :total="500" />
  <Pagination :isInfoText="true" :isPageSizeSelector="true" :modelValue="1" :sizePage="20" :total="500" />
</template>
