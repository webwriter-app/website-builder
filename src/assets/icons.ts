import { html } from "lit";

export const wbBox = html` <svg
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
  <g
    id="SVGRepo_tracerCarrier"
    stroke-linecap="round"
    stroke-linejoin="round"
  ></g>
  <g id="SVGRepo_iconCarrier">
    <path
      d="M9 12C9 11.5341 9 11.3011 9.07612 11.1173C9.17761 10.8723 9.37229 10.6776 9.61732 10.5761C9.80109 10.5 10.0341 10.5 10.5 10.5H13.5C13.9659 10.5 14.1989 10.5 14.3827 10.5761C14.6277 10.6776 14.8224 10.8723 14.9239 11.1173C15 11.3011 15 11.5341 15 12C15 12.4659 15 12.6989 14.9239 12.8827C14.8224 13.1277 14.6277 13.3224 14.3827 13.4239C14.1989 13.5 13.9659 13.5 13.5 13.5H10.5C10.0341 13.5 9.80109 13.5 9.61732 13.4239C9.37229 13.3224 9.17761 13.1277 9.07612 12.8827C9 12.6989 9 12.4659 9 12Z"
      stroke="#000000"
      stroke-width="1.5"
    ></path>
    <path
      d="M20.5 7V13C20.5 16.7712 20.5 18.6569 19.3284 19.8284C18.1569 21 16.2712 21 12.5 21H11.5M3.5 7V13C3.5 16.7712 3.5 18.6569 4.67157 19.8284C5.37634 20.5332 6.3395 20.814 7.81608 20.9259"
      stroke="#000000"
      stroke-width="1.5"
      stroke-linecap="round"
    ></path>
    <path
      d="M12 3H4C3.05719 3 2.58579 3 2.29289 3.29289C2 3.58579 2 4.05719 2 5C2 5.94281 2 6.41421 2.29289 6.70711C2.58579 7 3.05719 7 4 7H20C20.9428 7 21.4142 7 21.7071 6.70711C22 6.41421 22 5.94281 22 5C22 4.05719 22 3.58579 21.7071 3.29289C21.4142 3 20.9428 3 20 3H16"
      stroke="#000000"
      stroke-width="1.5"
      stroke-linecap="round"
    ></path>
  </g>
</svg>`;

export const wbGear = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  width="16"
  height="16"
  fill="currentColor"
  class="bi bi-gear"
  viewBox="0 0 16 16"
>
  <path
    d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"
  />
  <path
    d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z"
  />
</svg>`;

export const wbPlaceholderIMG =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160" viewBox="0 0 240 160">
  <rect width="240" height="160" fill="#f1f5f9"/>
  <rect x="18" y="18" width="204" height="124" rx="10" fill="#e2e8f0"/>
  <path d="M44 118l44-44 34 34 28-28 46 46H44z" fill="#cbd5e1"/>
  <circle cx="88" cy="64" r="10" fill="#94a3b8"/>
  <text x="120" y="148" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="12" fill="#64748b" text-anchor="middle">
    Image
  </text>
</svg>`);

export const wbCloseIcon = html` <svg
  xmlns="http://www.w3.org/2000/svg"
  width="1em"
  height="1em"
  viewBox="0 0 24 24"
>
  <title xmlns="">close</title>
  <path
    fill="currentColor"
    d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z"
  />
</svg>`;

export const wbSearchIcon = html` <svg
  xmlns="http://www.w3.org/2000/svg"
  width="1em"
  height="1em"
  viewBox="0 0 24 24"
>
  <title xmlns="">search</title>
  <path
    fill="currentColor"
    d="m19.485 20.154l-6.262-6.262q-.75.639-1.725.989t-1.96.35q-2.398 0-4.064-1.666Q3.808 11.898 3.808 9.5t1.666-4.064t4.064-1.667t4.065 1.667T15.269 9.5q0 1.042-.369 2.017t-.97 1.668l6.262 6.261zM9.539 14.23q1.99 0 3.36-1.37t1.37-3.361t-1.37-3.36t-3.36-1.37t-3.361 1.37t-1.37 3.36t1.37 3.36t3.36 1.37"
  />
</svg>`;

export const wbH1Icon = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  width="1em"
  height="1em"
  viewBox="0 0 24 24"
>
  <title>h1</title>
  <path
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
    d="M2.243 4.493v7.5m0 0v7.502m0-7.501h10.5m0-7.5v7.5m0 0v7.501m4.501-8.627l2.25-1.5v10.126m0 0h-2.25m2.25 0h2.25"
  />
</svg>`;

export const wbH2Icon = html` <svg
  xmlns="http://www.w3.org/2000/svg"
  width="1em"
  height="1em"
  viewBox="0 0 24 24"
>
  <title xmlns="">h2</title>
  <path
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
    d="M21.75 19.5H16.5v-1.609a2.25 2.25 0 0 1 1.244-2.012l2.89-1.445c.651-.326 1.116-.955 1.116-1.683q0-.748-.118-1.463c-.135-.825-.835-1.422-1.668-1.489a15.2 15.2 0 0 0-3.464.12M2.243 4.492v7.5m0 0v7.502m0-7.501h10.5m0-7.5v7.5m0 0v7.501"
  />
</svg>`;

export const wbH3Icon = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  width="1em"
  height="1em"
  viewBox="0 0 24 24"
>
  <title xmlns="">h3</title>
  <path
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
    d="M20.906 14.626a4.52 4.52 0 0 1 .738 3.603c-.155.695-.795 1.143-1.505 1.208a15.2 15.2 0 0 1-3.639-.104m4.406-4.707a4.52 4.52 0 0 0 .738-3.603c-.155-.696-.795-1.144-1.505-1.209a15.2 15.2 0 0 0-3.639.104m4.406 4.708H18M2.243 4.493v7.5m0 0v7.502m0-7.501h10.5m0-7.5v7.5m0 0v7.501"
  />
</svg>`;

export const wbH4Icon = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  width="1em"
  height="1em"
  viewBox="0 0 24 24"
>
  <title xmlns="">h4</title>
  <path
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
    d="M21 19.5V9.75l-4.5 7h5.75M2.247 4.496v7.5m0 0v7.502m0-7.5h10.5m0-7.5v7.5m0 0v7.5"
  />
</svg> `;

export const wbH5Icon = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  width="1em"
  height="1em"
  viewBox="0 0 24 24"
>
  <title xmlns="">h5</title>
  <path
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
    d="M21.5 9.752L17 9.75l-.25 4.75h2.5c1.75 0 2.25 1 2.25 2.25c0 1 0 2.5-1.536 2.702a13 13 0 0 1-3.214-.12M2.247 4.496v7.5m0 0v7.502m0-7.5h10.5m0-7.5v7.5m0 0v7.5"
  />
</svg> `;

export const wbH6Icon = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  width="1em"
  height="1em"
  viewBox="0 0 24 24"
>
  <title xmlns="">h6</title>
  <path
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
    d="M16.5 16.5c0-1.5 1.25-2 2.75-2s2.5.75 2.5 2.5s-1 2.5-2.5 2.5s-2.75-.75-2.75-2.5v-3.25c0-3.25 1.5-4.5 4.75-3.75M2.247 4.496v7.5m0 0v7.502m0-7.5h10.5m0-7.5v7.5m0 0v7.5"
  />
</svg>`;

export const wbTextIcon = html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
  >
    <title xmlns="">text</title>
    <path fill="currentColor" d="M21 6v2H3V6zM3 18h9v-2H3zm0-5h18v-2H3z" />
  </svg>
`;

export const wbImageIcon = html` <svg
  xmlns="http://www.w3.org/2000/svg"
  width="1em"
  height="1em"
  viewBox="0 0 24 24"
>
  <title xmlns="">image</title>
  <path
    fill="currentColor"
    d="M5 3h13a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3m0 1a2 2 0 0 0-2 2v11.59l4.29-4.3l2.5 2.5l5-5L20 16V6a2 2 0 0 0-2-2zm4.79 13.21l-2.5-2.5L3 19a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-1.59l-5.21-5.2zM7.5 6A2.5 2.5 0 0 1 10 8.5A2.5 2.5 0 0 1 7.5 11A2.5 2.5 0 0 1 5 8.5A2.5 2.5 0 0 1 7.5 6m0 1A1.5 1.5 0 0 0 6 8.5A1.5 1.5 0 0 0 7.5 10A1.5 1.5 0 0 0 9 8.5A1.5 1.5 0 0 0 7.5 7"
  />
</svg>`;

export const wbIconIcon = html` <svg
  xmlns="http://www.w3.org/2000/svg"
  width="1em"
  height="1em"
  viewBox="0 0 48 48"
>
  <title xmlns="">any-icon</title>
  <path
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    d="M13.722 5.5a8.226 8.226 0 0 1 8.222 8.222v8.222h-8.222A8.226 8.226 0 0 1 5.5 13.722h0A8.226 8.226 0 0 1 13.722 5.5m20.556 0a8.226 8.226 0 0 1 8.222 8.222h0a8.226 8.226 0 0 1-8.222 8.222h-8.222v-8.222A8.226 8.226 0 0 1 34.278 5.5M13.722 26.056h8.222v8.222a8.226 8.226 0 0 1-8.222 8.222h0A8.226 8.226 0 0 1 5.5 34.278h0a8.226 8.226 0 0 1 8.222-8.222m12.334 0h8.222a8.226 8.226 0 0 1 8.222 8.222h0a8.226 8.226 0 0 1-8.222 8.222h0a8.226 8.226 0 0 1-8.222-8.222z"
  />
</svg>`;

export const wbButtonIcon = html` <svg
  xmlns="http://www.w3.org/2000/svg"
  width="1em"
  height="1em"
  viewBox="0 0 24 24"
>
  <title xmlns="">button</title>
  <path
    fill="currentColor"
    d="M8 12.5h8V11H8zm11-6H5a2 2 0 0 0-2 2V15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a2 2 0 0 0-2-2M5 8h14a.5.5 0 0 1 .5.5V15a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5V8.5A.5.5 0 0 1 5 8"
  />
</svg>`;

export const wbDividerIcon = html` <svg
  xmlns="http://www.w3.org/2000/svg"
  width="1em"
  height="1em"
  viewBox="0 0 15 15"
>
  <title xmlns="">divider-horizontal</title>
  <path fill="currentColor" d="M12.5 7a.5.5 0 0 1 0 1h-10a.5.5 0 0 1 0-1z" />
</svg>`;

export const wbAudioIcon = html` <svg
  xmlns="http://www.w3.org/2000/svg"
  width="1em"
  height="1em"
  viewBox="0 0 24 24"
>
  <title xmlns="">audio</title>
  <path
    fill="currentColor"
    d="M8 4v10.184A3 3 0 0 0 7 14a3 3 0 1 0 3 3V7h7v4.184A3 3 0 0 0 16 11a3 3 0 1 0 3 3V4z"
  />
</svg>`;

export const wbLabelIcon = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  width="1em"
  height="1em"
  viewBox="0 0 24 24"
>
  <title xmlns="">label-outline-sharp</title>
  <path
    fill="currentColor"
    d="M3 19V5h12.635L21 12l-5.365 7zm1-1h11.135l4.615-6l-4.615-6H4zm7.885-6"
  />
</svg>`;

export const wbVideoIcon = html` <svg
  xmlns="http://www.w3.org/2000/svg"
  width="1em"
  height="1em"
  viewBox="0 0 24 24"
>
  <title xmlns="">video-line</title>
  <g fill="none" fill-rule="evenodd">
    <path
      d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"
    />
    <path
      fill="currentColor"
      d="M20 3a2 2 0 0 1 1.995 1.85L22 5v14a2 2 0 0 1-1.85 1.995L20 21H4a2 2 0 0 1-1.995-1.85L2 19V5a2 2 0 0 1 1.85-1.995L4 3zm0 2H4v14h16zm-9.66 2.638l.518.23l.338.16l.387.19l.43.218l.47.25l.507.28l.266.152l.518.305l.474.292l.43.273l.38.253l.48.33l.364.263l.095.07a1.234 1.234 0 0 1 0 1.98l-.323.235l-.44.308l-.356.239l-.405.263l-.453.283l-.499.3l-.534.309l-.509.282l-.471.25l-.43.22l-.386.188l-.622.288l-.23.1a1.234 1.234 0 0 1-1.714-.99l-.058-.565l-.032-.374l-.042-.664l-.023-.508l-.015-.555l-.004-.294l-.002-.305q0-.31.006-.6l.015-.555l.023-.507l.027-.457l.03-.401l.075-.744a1.235 1.235 0 0 1 1.715-.992m.611 2.501l-.436-.218l-.029.487l-.022.551l-.013.61l-.002.325l.002.325l.013.609l.01.283l.026.52l.015.235l.434-.218l.487-.256l.535-.294l.284-.162l.551-.326l.494-.306l.436-.28l.196-.13l-.407-.27l-.466-.294a30 30 0 0 0-.803-.48l-.283-.161l-.534-.294z"
    />
  </g>
</svg>`;

export const wbLinkIcon = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  width="1em"
  height="1em"
  viewBox="0 0 24 24"
>
  <title xmlns="">link</title>
  <path
    fill="currentColor"
    d="M11 17H7q-2.075 0-3.537-1.463T2 12t1.463-3.537T7 7h4v2H7q-1.25 0-2.125.875T4 12t.875 2.125T7 15h4zm-3-4v-2h8v2zm5 4v-2h4q1.25 0 2.125-.875T20 12t-.875-2.125T17 9h-4V7h4q2.075 0 3.538 1.463T22 12t-1.463 3.538T17 17z"
  />
</svg>`;

export const wbTextareaIcon = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  width="0.94em"
  height="1em"
  viewBox="0 0 15 16"
>
  <title xmlns="">textarea</title>
  <path
    fill="currentColor"
    d="M12.5 2h-10v4.5h-1V2c0-.55.45-1 1-1h10c.55 0 1 .45 1 1v4.5h-1zm-10 12h10V9.5h1V14c0 .55-.45 1-1 1h-10c-.55 0-1-.45-1-1V9.5h1z"
  />
  <path
    fill="currentColor"
    d="M10.5 5h-6c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h6c.28 0 .5.22.5.5s-.22.5-.5.5"
  />
  <path
    fill="currentColor"
    d="M7.5 12c-.28 0-.5-.22-.5-.5v-7c0-.28.22-.5.5-.5s.5.22.5.5v7c0 .28-.22.5-.5.5M2 10c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2m0-3c-.55 0-1 .45-1 1s.45 1 1 1s1-.45 1-1s-.45-1-1-1m11 3c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2m0-3c-.55 0-1 .45-1 1s.45 1 1 1s1-.45 1-1s-.45-1-1-1"
  />
</svg>`;
