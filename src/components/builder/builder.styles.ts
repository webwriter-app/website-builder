import { css } from "lit";

import { hostStyles } from "./host.styles";
import { layoutStyles } from "./layout.styles";
import { paletteStyles } from "./palette.styles";
import { codePanelStyles } from "./code-panel.styles";
import { draggingStyles } from "./dragging.styles";
import { settingsStyles } from "./settings.styles";
import { iconDialogStyles } from "./icon-dialog.styles";
import { allComponentsStyles } from "./all-components.styles";
import { floatingToolbarStyles } from "./floating-toolbar.styles";

export const builderStyles = css`
  ${hostStyles}
  ${layoutStyles}
  ${paletteStyles}
  ${codePanelStyles}
  ${draggingStyles}
  ${settingsStyles}
  ${iconDialogStyles}
  ${allComponentsStyles}
  ${floatingToolbarStyles}
`;
