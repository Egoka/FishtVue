<template>
  <svg
    id="Layer_1"
    style="enable-background: new 0 0 1000 1000"
    version="1.1"
    viewBox="0 0 1000 1000"
    x="0px"
    xml:space="preserve"
    xmlns="http://www.w3.org/2000/svg"
    y="0px">
    <!--ring 5-->
    <circle class="st3067" cx="500" cy="500" r="160" />
    <circle class="st3067 st3067--small" cx="500" cy="500" r="160" transform="rotate(0 500 500)">
      <animateTransform
        attributeName="transform"
        attributeType="xml"
        dur="5s"
        from="0 500 500"
        repeatCount="indefinite"
        to="-360 500 500"
        type="rotate" />
    </circle>
    <!--ring 4-->
    <circle class="st3067 st3067--transparent" cx="500" cy="500" r="240" />
    <circle class="st3067 st3067--medium" cx="500" cy="500" r="240" transform="rotate(0 500 500)">
      <animateTransform
        attributeName="transform"
        attributeType="xml"
        dur="4s"
        from="0 500 500"
        repeatCount="indefinite"
        to="-360 500 500"
        type="rotate" />
    </circle>
    <!--ring 3-->
    <circle class="st3067" cx="500" cy="500" r="320" />
    <circle class="st3067 st3067--three" cx="500" cy="500" r="320" transform="rotate(0 500 500)">
      <animateTransform
        attributeName="transform"
        attributeType="xml"
        dur="2s"
        from="0 500 500"
        repeatCount="indefinite"
        to="-360 500 500"
        type="rotate" />
    </circle>
    <!--ring 2-->
    <circle class="st3067" cx="500" cy="500" r="400" />
    <circle class="st3067 st3067--large" cx="500" cy="500" r="400" transform="rotate(0 500 500)">
      <animateTransform
        attributeName="transform"
        attributeType="xml"
        dur="5s"
        from="0 500 500"
        repeatCount="indefinite"
        to="-360 500 500"
        type="rotate" />
    </circle>
    <!--ring 1-->
    <circle class="st3067" cx="500" cy="500" r="480" />
    <circle class="st3067 st3067--xlarge" cx="500" cy="500" r="480" transform="rotate(0 500 500)">
      <animateTransform
        attributeName="transform"
        attributeType="xml"
        dur="5s"
        from="0 500 500"
        repeatCount="indefinite"
        to="-360 500 500"
        type="rotate" />
    </circle>
  </svg>
</template>
<style scoped>
  .st3067 {
    fill: none;
    stroke: currentColor;
    stroke-width: 4pt;
    stroke-miterlimit: 10;
  }

  .st3067--transparent {
    stroke: rgba(#ffffff, 0);
  }

  .st3067--xlarge {
    stroke-linecap: square;
    stroke-dasharray: 2000, 513;
    stroke-width: 20;
  }

  .st3067--large {
    stroke-linecap: square;
    stroke-dasharray: 1500, 1013;
    stroke-width: 20;
  }

  .st3067--medium {
    stroke-linecap: square;
    stroke-dasharray: 1000, 1513;
    stroke-width: 20;
  }

  .st3067--small {
    stroke-linecap: square;
    stroke-dasharray: 500, 2013;
    stroke-width: 20;
  }

  .st3067--xsmall {
    stroke-linecap: square;
    stroke-dasharray: 100, 2413;
    stroke-width: 20;
  }

  .st3067--three {
    stroke-linecap: square;
    stroke-dasharray: 320, 320;
    stroke-width: 20;
  }
</style>
<script setup></script>
