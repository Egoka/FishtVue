<template>
  <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="4" cy="12" r="3">
      <animate id="spinner_jObz" attributeName="r" begin="0;spinner_vwSQ.end-0.25s" dur="0.75s" values="3;.2;3" />
    </circle>
    <circle cx="12" cy="12" r="3">
      <animate attributeName="r" begin="spinner_jObz.end-0.6s" dur="0.75s" values="3;.2;3" />
    </circle>
    <circle cx="20" cy="12" r="3">
      <animate id="spinner_vwSQ" attributeName="r" begin="spinner_jObz.end-0.45s" dur="0.75s" values="3;.2;3" />
    </circle>
  </svg>
</template>
