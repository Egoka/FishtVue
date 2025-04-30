<template>
  <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect height="14" opacity="1" width="6" x="1" y="4">
      <animate
        id="spinner_rQ7m"
        attributeName="opacity"
        begin="0;spinner_2dMV.end-0.25s"
        dur="0.75s"
        fill="freeze"
        values="1;.2" />
    </rect>
    <rect height="14" opacity=".4" width="6" x="9" y="4">
      <animate attributeName="opacity" begin="spinner_rQ7m.begin+0.15s" dur="0.75s" fill="freeze" values="1;.2" />
    </rect>
    <rect height="14" opacity=".3" width="6" x="17" y="4">
      <animate
        id="spinner_2dMV"
        attributeName="opacity"
        begin="spinner_rQ7m.begin+0.3s"
        dur="0.75s"
        fill="freeze"
        values="1;.2" />
    </rect>
  </svg>
</template>
