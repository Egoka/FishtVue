export default `
  :root {
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    line-height: 1.5;
    font-weight: 400;
    color-scheme: light dark;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }
  .fv {
    --fv-gradient-from-position: ;
    --fv-gradient-via-position: ;
    --fv-gradient-to-position: ;
    --fv-border-spacing-x: 0;
    --fv-border-spacing-y: 0;
    --fv-translate-x: 0;
    --fv-translate-y: 0;
    --fv-rotate: 0;
    --fv-skew-x: 0;
    --fv-skew-y: 0;
    --fv-scale-x: 1;
    --fv-scale-y: 1;
    --fv-pan-x: ;
    --fv-pan-y: ;
    --fv-pinch-zoom: ;
    --fv-scroll-snap-strictness: proximity;
    --fv-gradient-from-position: ;
    --fv-gradient-via-position: ;
    --fv-gradient-to-position: ;
    --fv-ordinal: ;
    --fv-slashed-zero: ;
    --fv-numeric-figure: ;
    --fv-numeric-spacing: ;
    --fv-numeric-fraction: ;
    --fv-ring-inset: ;
    --fv-ring-offset-width: 0px;
    --fv-ring-offset-color: #fff;
    --fv-ring-color: rgb(59 130 246 / 0.5);
    --fv-ring-offset-shadow: 0 0 #0000;
    --fv-ring-shadow: 0 0 #0000;
    --fv-shadow: 0 0 #0000;
    --fv-shadow-colored: 0 0 #0000;
    --fv-blur: ;
    --fv-brightness: ;
    --fv-contrast: ;
    --fv-grayscale: ;
    --fv-hue-rotate: ;
    --fv-invert: ;
    --fv-saturate: ;
    --fv-sepia: ;
    --fv-drop-shadow: ;
    --fv-backdrop-blur: ;
    --fv-backdrop-brightness: ;
    --fv-backdrop-contrast: ;
    --fv-backdrop-grayscale: ;
    --fv-backdrop-hue-rotate: ;
    --fv-backdrop-invert: ;
    --fv-backdrop-opacity: ;
    --fv-backdrop-saturate: ;
    --fv-backdrop-sepia: ;
  }
/*
1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)
2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)
*/

  .fv,
  ::before,
  ::after {
    box-sizing: border-box; /* 1 */
    border-width: 0; /* 2 */
    border-style: solid; /* 2 */
    border-color: #e5e7eb; /* 2 */
  }

  ::before,
  ::after {
    --fv-content: '';
  }

  /*
1. Use a consistent sensible line-height in all browsers.
2. Prevent adjustments of font size after orientation changes in iOS.
3. Use a more readable tab size.
4. Use the user's configured "sans" font-family by default.
5. Use the user's configured "sans" font-feature-settings by default.
6. Use the user's configured "sans" font-variation-settings by default.
7. Disable tap highlights on iOS
*/

  html,
  :host {
    line-height: 1.5; /* 1 */
    -webkit-text-size-adjust: 100%; /* 2 */
    -moz-tab-size: 4; /* 3 */
    -o-tab-size: 4;
    tab-size: 4; /* 3 */
    font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"; /* 4 */
    font-feature-settings: normal; /* 5 */
    font-variation-settings: normal; /* 6 */
    -webkit-tap-highlight-color: transparent; /* 7 */
  }

  /*
1. Remove the margin in all browsers.
2. Inherit line-height from "html" so users can set them as a class directly on the "html" element.
*/

  body {
    margin: 0; /* 1 */
    line-height: inherit; /* 2 */
  }

  /*
1. Add the correct height in Firefox.
2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)
3. Ensure horizontal rules are visible by default.
*/

  hr.fv {
    height: 0; /* 1 */
    color: inherit; /* 2 */
    border-top-width: 1px; /* 3 */
  }

  /*
Add the correct text decoration in Chrome, Edge, and Safari.
*/

  abbr:where([title]) {
    -webkit-text-decoration: underline dotted;
    text-decoration: underline dotted;
  }

  /*
Remove the default font size and weight for headings.
*/

  h1.fv,
  h2.fv,
  h3.fv,
  h4.fv,
  h5.fv,
  h6.fv {
    font-size: inherit;
    font-weight: inherit;
  }

  /*
Reset links to optimize for opt-in styling instead of opt-out.
*/

  a.fv {
    color: inherit;
    text-decoration: inherit;
  }

  /*
Add the correct font weight in Edge and Safari.
*/

  b.fv,
  strong.fv {
    font-weight: bolder;
  }

  /*
1. Use the user's configured "mono" font-family by default.
2. Use the user's configured "mono" font-feature-settings by default.
3. Use the user's configured "mono" font-variation-settings by default.
4. Correct the odd "em" font sizing in all browsers.
*/

  code.fv,
  kbd.fv,
  samp.fv,
  pre.fv {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; /* 1 */
    font-feature-settings: normal; /* 2 */
    font-variation-settings: normal; /* 3 */
    font-size: 1em; /* 4 */
  }

  /*
Add the correct font size in all browsers.
*/

  small.fv {
    font-size: 80%;
  }

  /*
Prevent "sub" and "sup" elements from affecting the line height in all browsers.
*/

  sub.fv,
  sup.fv {
    font-size: 75%;
    line-height: 0;
    position: relative;
    vertical-align: baseline;
  }

  sub.fv {
    bottom: -0.25em;
  }

  sup.fv {
    top: -0.5em;
  }

  /*
1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)
2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)
3. Remove gaps between table borders by default.
*/

  table.fv {
    text-indent: 0; /* 1 */
    border-color: inherit; /* 2 */
    border-collapse: collapse; /* 3 */
  }

  /*
1. Change the font styles in all browsers.
2. Remove the margin in Firefox and Safari.
3. Remove default padding in all browsers.
*/

  button.fv,
  input.fv,
  optgroup.fv,
  select.fv,
  textarea.fv {
    font-family: inherit; /* 1 */
    font-feature-settings: inherit; /* 1 */
    font-variation-settings: inherit; /* 1 */
    font-size: 100%; /* 1 */
    font-weight: inherit; /* 1 */
    line-height: inherit; /* 1 */
    color: inherit; /* 1 */
    margin: 0; /* 2 */
    padding: 0; /* 3 */
  }

  /*
Remove the inheritance of text transform in Edge and Firefox.
*/

  button.fv,
  select.fv {
    text-transform: none;
  }

  /*
1. Correct the inability to style clickable types in iOS and Safari.
2. Remove default button styles.
*/

  button.fv,
  .fv[type='button'],
  .fv[type='reset'],
  .fv[type='submit'] {
    -webkit-appearance: button; /* 1 */
    background-color: transparent; /* 2 */
    background-image: none; /* 2 */
  }

  /*
Use the modern Firefox focus style for all focusable elements.
*/

  :-moz-focusring {
    outline: auto;
  }

  /*
Remove the additional ":invalid" styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)
*/

  :-moz-ui-invalid {
    box-shadow: none;
  }

  /*
Add the correct vertical alignment in Chrome and Firefox.
*/

  progress.fv {
    vertical-align: baseline;
  }

  /*
Correct the cursor style of increment and decrement buttons in Safari.
*/

  ::-webkit-inner-spin-button,
  ::-webkit-outer-spin-button {
    height: auto;
  }

  /*
1. Correct the odd appearance in Chrome and Safari.
2. Correct the outline style in Safari.
*/

  .fv[type='search'] {
    -webkit-appearance: textfield; /* 1 */
    outline-offset: -2px; /* 2 */
  }

  /*
Remove the inner padding in Chrome and Safari on macOS.
*/

  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  /*
1. Correct the inability to style clickable types in iOS and Safari.
2. Change font properties to "inherit" in Safari.
*/

  ::-webkit-file-upload-button {
    -webkit-appearance: button; /* 1 */
    font: inherit; /* 2 */
  }

  /*
Add the correct display in Chrome and Safari.
*/

  summary.fv {
    display: list-item;
  }

  /*
Removes the default spacing and border for appropriate elements.
*/

  blockquote.fv,
  dl.fv,
  dd.fv,
  h1.fv,
  h2.fv,
  h3.fv,
  h4.fv,
  h5.fv,
  h6.fv,
  hr.fv,
  figure.fv,
  p.fv,
  pre.fv {
    margin: 0;
  }

  fieldset.fv {
    margin: 0;
    padding: 0;
  }

  legend.fv {
    padding: 0;
  }

  ol.fv,
  ul.fv,
  menu.fv {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  /*
Reset default styling for dialogs.
*/
  dialog.fv {
    padding: 0;
  }

  /*
Prevent resizing textareas horizontally by default.
*/

  textarea.fv {
    resize: vertical;
  }

  /*
1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)
2. Set the default placeholder color to the user's configured gray 400 color.
*/

  input::-moz-placeholder.fv,
  textarea::-moz-placeholder.fv {
    opacity: 1; /* 1 */
    color: #9ca3af; /* 2 */
  }

  input::placeholder.fv,
  textarea::placeholder.fv {
    opacity: 1; /* 1 */
    color: #9ca3af; /* 2 */
  }

  /*
Set the default cursor for buttons.
*/

  button.fv,
  [role="button"].fv {
    cursor: pointer;
  }

  /*
Make sure disabled buttons don't get the pointer cursor.
*/
  .fv:disabled {
    cursor: default;
  }

  /*
1. Make replaced elements "display: block" by default. (https://github.com/mozdevs/cssremedy/issues/14)
2. Add "vertical-align: middle" to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)
   This can trigger a poorly considered lint error in some tools but is included by design.
*/

  img.fv,
  svg.fv,
  video.fv,
  canvas.fv,
  audio.fv,
  iframe.fv,
  embed.fv,
  object.fv {
    display: block; /* 1 */
    vertical-align: middle; /* 2 */
  }

  /*
Constrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)
*/

  img.fv,
  video.fv {
    max-width: 100%;
    height: auto;
  }

  /* Make elements with the HTML hidden attribute stay hidden by default */
  .fv[hidden] {
    display: none;
  }
  [type='text'].fv,
  input:where(:not([type])).fv,
  [type='email'],[type='url'].fv,
  [type='password'].fv,
  [type='number'].fv,
  [type='date'].fv,
  [type='datetime-local'].fv,
  [type='month'].fv,
  [type='search'].fv,
  [type='tel'].fv,
  [type='time'].fv,
  [type='week'].fv,
  [multiple].fv,
  textarea.fv,
  select.fv{
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-color: #fff;
    border-color: #6b7280;
    border-width: 1px;
    border-radius: 0px;
    padding-top: 0.5rem;
    padding-right: 0.75rem;
    padding-bottom: 0.5rem;
    padding-left: 0.75rem;
    font-size: 1rem;
    line-height: 1.5rem;
    --fv-shadow: 0 0 #0000;
  }
  [type='text']:focus.fv,
  input:where(:not([type])):focus.fv,
  [type='email']:focus.fv,
  [type='url']:focus.fv,
  [type='password']:focus.fv,
  [type='number']:focus.fv,
  [type='date']:focus.fv,
  [type='datetime-local']:focus.fv,
  [type='month']:focus.fv,
  [type='search']:focus.fv,
  [type='tel']:focus.fv,
  [type='time']:focus.fv,
  [type='week']:focus.fv,
  [multiple]:focus.fv,
  textarea:focus.fv,
  select:focus.fv{
    outline: 2px solid transparent;
    outline-offset: 2px;
    --fv-ring-inset: var(--fv-empty,/*!*/ /*!*/);
    --fv-ring-offset-width: 0px;
    --fv-ring-offset-color: #fff;
    --fv-ring-color: #2563eb;
    --fv-ring-offset-shadow: var(--fv-ring-inset) 0 0 0 var(--fv-ring-offset-width) var(--fv-ring-offset-color);
    --fv-ring-shadow: var(--fv-ring-inset) 0 0 0 calc(1px + var(--fv-ring-offset-width)) var(--fv-ring-color);
    box-shadow: var(--fv-ring-offset-shadow), var(--fv-ring-shadow), var(--fv-shadow);
    border-color: #2563eb;
  }
  input::-moz-placeholder.fv,
  textarea::-moz-placeholder.fv{
    color: #6b7280;
    opacity: 1;
  }
  input::placeholder.fv,
  textarea::placeholder.fv{
    color: #6b7280;
    opacity: 1;
  }
  ::-webkit-datetime-edit-fields-wrapper{
    padding: 0;
  }
  ::-webkit-date-and-time-value{
    min-height: 1.5em;
    text-align: inherit;
  }
  ::-webkit-datetime-edit{
    display: inline-flex;
  }
  ::-webkit-datetime-edit,::-webkit-datetime-edit-year-field,::-webkit-datetime-edit-month-field,::-webkit-datetime-edit-day-field,::-webkit-datetime-edit-hour-field,::-webkit-datetime-edit-minute-field,::-webkit-datetime-edit-second-field,::-webkit-datetime-edit-millisecond-field,::-webkit-datetime-edit-meridiem-field{
    padding-top: 0;
    padding-bottom: 0;
  }
  select.fv{
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  [multiple],
  [size]:where(select:not([size="1"])){
    background-image: initial;
    background-position: initial;
    background-repeat: unset;
    background-size: initial;
    padding-right: 0.75rem;
    -webkit-print-color-adjust: unset;
    print-color-adjust: unset;
  }
  [type='checkbox'],
  [type='radio']{
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    padding: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    display: inline-block;
    vertical-align: middle;
    background-origin: border-box;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
    flex-shrink: 0;
    height: 1rem;
    width: 1rem;
    color: #2563eb;
    background-color: #fff;
    border-color: #6b7280;
    border-width: 1px;
    --fv-shadow: 0 0 #0000;
  }
  [type='checkbox']:checked,
  [type='radio']:checked {
    border-color: transparent;
    background-color: currentColor;
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
  }
  [type='checkbox']{
    border-radius: 0px;
  }
  [type='radio']{
    border-radius: 100%;
  }
  [type='checkbox']:focus,[type='radio']:focus{
    outline: 2px solid transparent;
    outline-offset: 2px;
    --fv-ring-inset: var(--fv-empty,/*!*/ /*!*/);
    --fv-ring-offset-width: 2px;
    --fv-ring-offset-color: #fff;
    --fv-ring-color: #2563eb;
    --fv-ring-offset-shadow: var(--fv-ring-inset) 0 0 0 var(--fv-ring-offset-width) var(--fv-ring-offset-color);
    --fv-ring-shadow: var(--fv-ring-inset) 0 0 0 calc(2px + var(--fv-ring-offset-width)) var(--fv-ring-color);
    box-shadow: var(--fv-ring-offset-shadow), var(--fv-ring-shadow), var(--fv-shadow);
  }
  [type='checkbox']:checked,[type='radio']:checked{
    border-color: transparent;
    background-color: currentColor;
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
  }
  [type='checkbox']:checked{
    background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
  }
  @media (forced-colors: active) {

    [type='checkbox']:checked{
      -webkit-appearance: auto;
      -moz-appearance: auto;
      appearance: auto;
    }
  }
  [type='radio']:checked{
    background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e");
  }
  @media (forced-colors: active) {

    [type='radio']:checked{
      -webkit-appearance: auto;
      -moz-appearance: auto;
      appearance: auto;
    }
  }
  [type='checkbox']:checked:hover,[type='checkbox']:checked:focus,[type='radio']:checked:hover,[type='radio']:checked:focus{
    border-color: transparent;
    background-color: currentColor;
  }
  [type='checkbox']:indeterminate{
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 16 16'%3e%3cpath stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 8h8'/%3e%3c/svg%3e");
    border-color: transparent;
    background-color: currentColor;
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
  }
  @media (forced-colors: active) {

    [type='checkbox']:indeterminate{
      -webkit-appearance: auto;
      -moz-appearance: auto;
      appearance: auto;
    }
  }
  [type='checkbox']:indeterminate:hover,[type='checkbox']:indeterminate:focus{
    border-color: transparent;
    background-color: currentColor;
  }
  [type='file']{
    background: unset;
    border-color: inherit;
    border-width: 0;
    border-radius: 0;
    padding: 0;
    font-size: unset;
    line-height: inherit;
  }
  [type='file']:focus{
    outline: 1px solid ButtonText;
    outline: 1px auto -webkit-focus-ring-color;
  }
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
@keyframes bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}
`
