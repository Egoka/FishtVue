<template>
  <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="0">
      <animate
        id="spinner_kIfO"
        attributeName="r"
        begin="0;spinner_xBIM.end"
        calcMode="spline"
        dur="1.2s"
        fill="freeze"
        keySplines=".52,.6,.25,.99"
        values="0;11" />
      <animate
        attributeName="opacity"
        begin="0;spinner_xBIM.end"
        calcMode="spline"
        dur="1.2s"
        fill="freeze"
        keySplines=".52,.6,.25,.99"
        values="1;0" />
    </circle>
    <circle cx="12" cy="12" r="0">
      <animate
        id="spinner_Pbsh"
        attributeName="r"
        begin="spinner_kIfO.begin+0.2s"
        calcMode="spline"
        dur="1.2s"
        fill="freeze"
        keySplines=".52,.6,.25,.99"
        values="0;11" />
      <animate
        attributeName="opacity"
        begin="spinner_kIfO.begin+0.2s"
        calcMode="spline"
        dur="1.2s"
        fill="freeze"
        keySplines=".52,.6,.25,.99"
        values="1;0" />
    </circle>
    <circle cx="12" cy="12" r="0">
      <animate
        id="spinner_xBIM"
        attributeName="r"
        begin="spinner_kIfO.begin+0.4s"
        calcMode="spline"
        dur="1.2s"
        fill="freeze"
        keySplines=".52,.6,.25,.99"
        values="0;11" />
      <animate
        attributeName="opacity"
        begin="spinner_kIfO.begin+0.4s"
        calcMode="spline"
        dur="1.2s"
        fill="freeze"
        keySplines=".52,.6,.25,.99"
        values="1;0" />
    </circle>
  </svg>
</template>
