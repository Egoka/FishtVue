<template>
  <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,20a9,9,0,1,1,9-9A9,9,0,0,1,12,21Z"
      transform="translate(12, 12) scale(0)">
      <animateTransform
        id="spinner_g88x"
        attributeName="transform"
        begin="0;spinner_yOmw.begin+0.6s"
        calcMode="spline"
        dur="1.2s"
        keySplines=".52,.6,.25,.99"
        type="translate"
        values="12 12;0 0" />
      <animateTransform
        additive="sum"
        attributeName="transform"
        begin="0;spinner_yOmw.begin+0.6s"
        calcMode="spline"
        dur="1.2s"
        keySplines=".52,.6,.25,.99"
        type="scale"
        values="0;1" />
      <animate
        attributeName="opacity"
        begin="0;spinner_yOmw.begin+0.6s"
        calcMode="spline"
        dur="1.2s"
        keySplines=".52,.6,.25,.99"
        values="1;0" />
    </path>
    <path
      d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,20a9,9,0,1,1,9-9A9,9,0,0,1,12,21Z"
      transform="translate(12, 12) scale(0)">
      <animateTransform
        id="spinner_yOmw"
        attributeName="transform"
        begin="spinner_g88x.begin+0.6s"
        calcMode="spline"
        dur="1.2s"
        keySplines=".52,.6,.25,.99"
        type="translate"
        values="12 12;0 0" />
      <animateTransform
        additive="sum"
        attributeName="transform"
        begin="spinner_g88x.begin+0.6s"
        calcMode="spline"
        dur="1.2s"
        keySplines=".52,.6,.25,.99"
        type="scale"
        values="0;1" />
      <animate
        attributeName="opacity"
        begin="spinner_g88x.begin+0.6s"
        calcMode="spline"
        dur="1.2s"
        keySplines=".52,.6,.25,.99"
        values="1;0" />
    </path>
  </svg>
</template>
