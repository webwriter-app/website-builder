import "@shoelace-style/shoelace/dist/themes/light.css";

import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js";
import SlInput from "@shoelace-style/shoelace/dist/components/input/input.component.js";
import SlSelect from "@shoelace-style/shoelace/dist/components/select/select.component.js";
import SlOption from "@shoelace-style/shoelace/dist/components/option/option.component.js";
import SlSwitch from "@shoelace-style/shoelace/dist/components/switch/switch.component.js";
import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.component.js";
import SlDivider from "@shoelace-style/shoelace/dist/components/divider/divider.component.js";
import SlTextarea from "@shoelace-style/shoelace/dist/components/textarea/textarea.component.js";
import SlIconButton from "@shoelace-style/shoelace/dist/components/icon-button/icon-button.component.js";
import SlRange from "@shoelace-style/shoelace/dist/components/range/range.component.js";
import SlPopup from "@shoelace-style/shoelace/dist/components/popup/popup.component.js";
import SlCard from "@shoelace-style/shoelace/dist/components/card/card.component.js";

export const shoelaceScoped = {
  "sl-button": SlButton,
  "sl-input": SlInput,
  "sl-select": SlSelect,
  "sl-option": SlOption,
  "sl-switch": SlSwitch,
  "sl-icon": SlIcon,
  "sl-divider": SlDivider,
  "sl-textarea": SlTextarea,
  "sl-icon-button": SlIconButton,
  "sl-range": SlRange,
  "sl-popup": SlPopup,
  "sl-card": SlCard,
};
import { registerIconLibrary } from "@shoelace-style/shoelace/dist/utilities/icon-library.js";
registerIconLibrary("default", {
  resolver: (name) =>
    `https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/${name}.svg`,
  mutator: (svg) => svg.setAttribute("fill", "currentColor"),
});
