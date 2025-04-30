<template>
  <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect height="12" width="2.8" x="1" y="6">
      <animate
        attributeName="y"
        begin="spinner_Diec.begin+0.4s"
        calcMode="spline"
        dur="0.6s"
        keySplines=".14,.73,.34,1;.65,.26,.82,.45"
        values="6;1;6" />
      <animate
        attributeName="height"
        begin="spinner_Diec.begin+0.4s"
        calcMode="spline"
        dur="0.6s"
        keySplines=".14,.73,.34,1;.65,.26,.82,.45"
        values="12;22;12" />
    </rect>
    <rect height="12" width="2.8" x="5.8" y="6">
      <animate
        attributeName="y"
        begin="spinner_Diec.begin+0.2s"
        calcMode="spline"
        dur="0.6s"
        keySplines=".14,.73,.34,1;.65,.26,.82,.45"
        values="6;1;6" />
      <animate
        attributeName="height"
        begin="spinner_Diec.begin+0.2s"
        calcMode="spline"
        dur="0.6s"
        keySplines=".14,.73,.34,1;.65,.26,.82,.45"
        values="12;22;12" />
    </rect>
    <rect height="12" width="2.8" x="10.6" y="6">
      <animate
        id="spinner_Diec"
        attributeName="y"
        begin="0;spinner_dm8s.end-0.1s"
        calcMode="spline"
        dur="0.6s"
        keySplines=".14,.73,.34,1;.65,.26,.82,.45"
        values="6;1;6" />
      <animate
        attributeName="height"
        begin="0;spinner_dm8s.end-0.1s"
        calcMode="spline"
        dur="0.6s"
        keySplines=".14,.73,.34,1;.65,.26,.82,.45"
        values="12;22;12" />
    </rect>
    <rect height="12" width="2.8" x="15.4" y="6">
      <animate
        attributeName="y"
        begin="spinner_Diec.begin+0.2s"
        calcMode="spline"
        dur="0.6s"
        keySplines=".14,.73,.34,1;.65,.26,.82,.45"
        values="6;1;6" />
      <animate
        attributeName="height"
        begin="spinner_Diec.begin+0.2s"
        calcMode="spline"
        dur="0.6s"
        keySplines=".14,.73,.34,1;.65,.26,.82,.45"
        values="12;22;12" />
    </rect>
    <rect height="12" width="2.8" x="20.2" y="6">
      <animate
        id="spinner_dm8s"
        attributeName="y"
        begin="spinner_Diec.begin+0.4s"
        calcMode="spline"
        dur="0.6s"
        keySplines=".14,.73,.34,1;.65,.26,.82,.45"
        values="6;1;6" />
      <animate
        attributeName="height"
        begin="spinner_Diec.begin+0.4s"
        calcMode="spline"
        dur="0.6s"
        keySplines=".14,.73,.34,1;.65,.26,.82,.45"
        values="12;22;12" />
    </rect>
  </svg>
</template>
