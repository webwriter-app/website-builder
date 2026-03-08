import { css } from "lit";

import { hostStyles } from "./host";
import { layoutStyles } from "./layout";
import { paletteStyles } from "./palette";
import { codePanelStyles } from "./code-panel";
import { draggingStyles } from "./dragging";
import { settingsStyles } from "./settings";
import { iconDialogStyles } from "./dialogs/icon-dialog";
import { allComponentsStyles } from "./dialogs/all-components";
import { floatingToolbarStyles } from "./floating-toolbar";

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
