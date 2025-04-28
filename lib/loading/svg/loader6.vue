<template>
  <svg
    id="L6"
    enable-background="new 0 0 100 100"
    version="1.1"
    viewBox="0 0 100 100"
    x="0px"
    xml:space="preserve"
    xmlns="http://www.w3.org/2000/svg"
    y="0px">
    <rect fill="none" height="50" stroke="currentColor" stroke-width="4" width="50" x="25" y="25">
      <animateTransform
        id="strokeBox"
        attributeName="transform"
        attributeType="XML"
        begin="rectBox.end"
        dur="0.5s"
        from="0 50 50"
        to="180 50 50"
        type="rotate" />
    </rect>
    <rect fill="currentColor" height="50" width="46" x="27" y="27">
      <animate
        id="rectBox"
        attributeName="height"
        attributeType="XML"
        begin="0s;strokeBox.end"
        dur="1.3s"
        fill="freeze"
        from="50"
        to="0" />
    </rect>
  </svg>
</template>
