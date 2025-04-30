<template>
  <svg fill="currentColor" viewBox="0 0 40 4" xmlns="http://www.w3.org/2000/svg">
    <rect class="react" fill="currentColor" height="4" width="40" />
  </svg>
</template>
<style scoped>
  .react {
    animation: moving 1s ease-in-out infinite;
  }

  @keyframes moving {
    0% {
      width: 0%;
    }

    50% {
      width: 100%;
      transform: translate(0%, 0);
    }

    100% {
      width: 0;
      right: 0;
      transform: translate(100%, 0);
    }
  }
</style>
<script setup></script>
