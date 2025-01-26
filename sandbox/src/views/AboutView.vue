<script setup lang="ts">
  import Input from "fishtvue/input/Input.vue"
  import Button from "fishtvue/button/Button.vue"
</script>
<template>
  <div class="about">
    <Input />
    <Button size="xs" color="theme"> Button</Button>
  </div>
</template>

<style>
  .about {
    margin: 2rem;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  @media (min-width: 1024px) {
    .about {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>
