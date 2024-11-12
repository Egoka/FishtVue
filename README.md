<style>
@import url('https://fonts.googleapis.com/css2?family=Asap:ital,wght@0,100..900;1,100..900&display=swap');
</style>
<a href="https://github.com/Egoka/FishtVue"><img alt="Banner.png" src=".github/assets/banner.png"/></a>
<div style="color: var(--fgColor-muted, #939393) !important; font-family: 'Asap', sans-serif; font-weight: 300; font-size: 1rem;">
  <div style="text-align: center; border-bottom: 1px solid;border-color: var(--borderColor-default, var(--color-border-default, #d0d7de)); padding-bottom: 1rem;">
    <div style="font-weight: bold;">
      <span style="font-size: 2rem;text-shadow: 0 4px 18px rgba(157,157,157,0.85);background-clip: text;-webkit-text-fill-color: transparent;background-image: linear-gradient(309deg, rgb(157, 255, 121) 12%, var(--fgColor-default, rgb(145, 145, 145)) 50%, var(--fgColor-muted, rgb(47, 47, 47)) 80%);">
        Fisht
      </span>
      <span style="font-size: 2rem;text-shadow: 0 4px 18px rgba(0,217,76,0.85);background-clip: text;-webkit-text-fill-color: transparent;background-image: linear-gradient(309deg, rgb(166,255,191) 12%, rgb(102,255,51) 50%, rgb(101,101,101) 100%);">
        Vue
      </span>
    </div>
    <p>
      <a href="https://github.com/Egoka/FishtVue/blob/lib/LICENSE.md"><img src=".github/assets/fisht-license.svg" alt="License"></a>
      <a href="https://github.com/Egoka/FishtVue"><img src=".github/assets/fisht-docs.svg" alt="Website"></a>
    </p>
    <div>Beautiful components that you can use in your applications.</div>
  </div>
</div>

## Introduction

Fishtvue is a Vue.js component library designed to create convenient and stylish user interfaces. It provides a set of highly customizable components that can be easily integrated into projects, helping accelerate development. The library is oriented towards modern design and supports features like theming, localization, and intuitive configuration options for each component.

Components can be configured both globally and individually, allowing them to be adapted for specific project needs. With TypeScript support, fishtvue easily integrates with various projects, providing stability and type safety.

## Installation and Setup

1.	Install fishtvue via npm or yarn:

```npm install fishtvue```


2.	Connect the library to your project. In the main.ts file, use createApp to integrate fishtvue with the desired configuration:
```
import { createApp } from 'vue';
import FishtVue, { type FishtVueConfiguration } from 'fishtvue/config';
import App from './App.vue';

const app = createApp(App);

// Integrate and configure the library
app.use<FishtVueConfiguration>(FishtVue, {
    componentsOptions: {
        Alert: {
            type: "info" // Default setting for the Alert component
        }
    },
    locale: {
        en: {
           // Localization settings
        }
    },
    inputStyle: "filled", // Global style for input fields
    theme: {
        semantic: {
            customThemeColor: "50deg",
            customThemeColorContrast: "40%"
        }
    }
});

app.mount('#app');
```


## Documentation

For more detailed information on each component and available configuration options, please refer to the full fishtvue documentation. The documentation includes usage examples, detailed parameter descriptions, and additional guides.

Link to full documentation (replace with the actual link when the documentation site is ready)

## Contribution

We welcome community contributions and are open to suggestions for improving fishtvue. If you have ideas for enhancing the library or find any issues, feel free to create an issue or submit a pull request. Please review our contribution guidelines and code standards before submitting.

## License

fishtvue is distributed under the Massachusetts Institute of Technology License (MIT License). This means the library is open source, allowing you to freely use, modify, and distribute it with attribution.