import type { MsgFn } from "@lit/localize";
import { TemplateResult } from "lit";

export type BindingKind = "text" | "html" | "attr" | "style";

// one binding per editable setting in the sidebar
export interface ComponentBinding {
  key: string; // e.g. "content", "src", "href"
  label: string; // sidebar label
  kind: BindingKind; // how to read/write
  target?: string; // selector within wrapper (default: first child)
  name?: string; // attr/style name if needed
  multiline?: boolean; // textarea vs input
  placeholder?: string;
}

// settings context for data-driven components
export type ComponentSettingsCtx = {
  data: Record<string, unknown>;
  setData: (patch: Record<string, unknown>) => void; // merge patch into data
};

// maps names (named it "type" here since it better matches the purpose) to builder components
export interface BuilderComponent {
  type: string;
  label: (msg: MsgFn) => string;
  group: "text" | "media" | "buttons" | "dividers";
  defaultData?: Record<string, unknown>;

  render(data: Record<string, unknown>, msg: MsgFn): TemplateResult;

  settings?: (ctx: ComponentSettingsCtx, msg: MsgFn) => TemplateResult;

  bindings?: (msg: MsgFn) => ComponentBinding[];
}
