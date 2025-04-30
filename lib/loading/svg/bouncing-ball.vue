<template>
  <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="12" cy="5" rx="4" ry="4">
      <animate
        id="spinner_jbYs"
        attributeName="cy"
        begin="0;spinner_JZdr.end"
        calcMode="spline"
        dur="0.375s"
        fill="freeze"
        keySplines=".33,0,.66,.33"
        values="5;20" />
      <animate
        attributeName="rx"
        begin="spinner_jbYs.end"
        calcMode="spline"
        dur="0.05s"
        keySplines=".33,0,.66,.33;.33,.66,.66,1"
        values="4;4.8;4" />
      <animate
        attributeName="ry"
        begin="spinner_jbYs.end"
        calcMode="spline"
        dur="0.05s"
        keySplines=".33,0,.66,.33;.33,.66,.66,1"
        values="4;3;4" />
      <animate
        id="spinner_ADF4"
        attributeName="cy"
        begin="spinner_jbYs.end"
        calcMode="spline"
        dur="0.025s"
        keySplines=".33,0,.66,.33"
        values="20;20.5" />
      <animate
        id="spinner_JZdr"
        attributeName="cy"
        begin="spinner_ADF4.end"
        calcMode="spline"
        dur="0.4s"
        keySplines=".33,.66,.66,1"
        values="20.5;5" />
    </ellipse>
  </svg>
</template>
