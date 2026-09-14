<template>
  <svg viewBox="204 184 264 32">
    <defs>
      <filter id="gooey" color-interpolation-filters="sRGB">
        <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="7" />
        <feColorMatrix in="blur" mode="matrix" result="gooey" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" />
        <feBlend in="SourceGraphic" in2="gooey" />
      </filter>
    </defs>
    <g class="ellipses" fill="currentColor" filter="url(#gooey)">
      <ellipse class="ellipse" cx="220" cy="200" rx="16" ry="16" />
      <ellipse class="ellipse" cx="280" cy="200" rx="16" ry="16" />
      <ellipse class="ellipse" cx="340" cy="200" rx="16" ry="16" />
      <ellipse class="ellipse" cx="400" cy="200" rx="16" ry="16" />
    </g>
  </svg>
</template>
<style scoped>
  @keyframes gooey {
    to {
      transform: translate3d(230px, 0, 0);
    }
  }

  .ellipse:nth-child(1) {
    animation: gooey 1s cubic-bezier(0.59, 0.8, 0.29, 0.1) infinite both alternate-reverse;
    animation-delay: 1s;
  }
</style>
<script setup></script>
