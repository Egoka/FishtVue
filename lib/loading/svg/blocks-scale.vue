<template>
  <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect height="9" rx="1" width="9" x="1.5" y="1.5">
      <animate
        id="spinner_M16P"
        attributeName="x"
        begin="0;spinner_wNI2.end+0.15s"
        dur="0.6s"
        keyTimes="0;.2;1"
        values="1.5;.5;1.5" />
      <animate attributeName="y" begin="0;spinner_wNI2.end+0.15s" dur="0.6s" keyTimes="0;.2;1" values="1.5;.5;1.5" />
      <animate attributeName="width" begin="0;spinner_wNI2.end+0.15s" dur="0.6s" keyTimes="0;.2;1" values="9;11;9" />
      <animate attributeName="height" begin="0;spinner_wNI2.end+0.15s" dur="0.6s" keyTimes="0;.2;1" values="9;11;9" />
    </rect>
    <rect height="9" rx="1" width="9" x="13.5" y="1.5">
      <animate
        attributeName="x"
        begin="spinner_M16P.begin+0.15s"
        dur="0.6s"
        keyTimes="0;.2;1"
        values="13.5;12.5;13.5" />
      <animate attributeName="y" begin="spinner_M16P.begin+0.15s" dur="0.6s" keyTimes="0;.2;1" values="1.5;.5;1.5" />
      <animate attributeName="width" begin="spinner_M16P.begin+0.15s" dur="0.6s" keyTimes="0;.2;1" values="9;11;9" />
      <animate attributeName="height" begin="spinner_M16P.begin+0.15s" dur="0.6s" keyTimes="0;.2;1" values="9;11;9" />
    </rect>
    <rect height="9" rx="1" width="9" x="13.5" y="13.5">
      <animate attributeName="x" begin="spinner_M16P.begin+0.3s" dur="0.6s" keyTimes="0;.2;1" values="13.5;12.5;13.5" />
      <animate attributeName="y" begin="spinner_M16P.begin+0.3s" dur="0.6s" keyTimes="0;.2;1" values="13.5;12.5;13.5" />
      <animate attributeName="width" begin="spinner_M16P.begin+0.3s" dur="0.6s" keyTimes="0;.2;1" values="9;11;9" />
      <animate attributeName="height" begin="spinner_M16P.begin+0.3s" dur="0.6s" keyTimes="0;.2;1" values="9;11;9" />
    </rect>
    <rect height="9" rx="1" width="9" x="1.5" y="13.5">
      <animate
        id="spinner_wNI2"
        attributeName="x"
        begin="spinner_M16P.begin+0.45s"
        dur="0.6s"
        keyTimes="0;.2;1"
        values="1.5;.5;1.5" />
      <animate
        attributeName="y"
        begin="spinner_M16P.begin+0.45s"
        dur="0.6s"
        keyTimes="0;.2;1"
        values="13.5;12.5;13.5" />
      <animate attributeName="width" begin="spinner_M16P.begin+0.45s" dur="0.6s" keyTimes="0;.2;1" values="9;11;9" />
      <animate attributeName="height" begin="spinner_M16P.begin+0.45s" dur="0.6s" keyTimes="0;.2;1" values="9;11;9" />
    </rect>
  </svg>
</template>
