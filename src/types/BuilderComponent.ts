import { TemplateResult } from "lit";

export type BindingKind = "text" | "html" | "attr" | "style";

// one binding per editable setting in the sidebar
export interface ComponentBinding {
  key: string;            // e.g. "content", "src", "href"
  label: string;          // sidebar label
  kind: BindingKind;      // how to read/write
  target?: string;        // selector within wrapper (default: first child)
  name?: string;          // attr/style name if needed
  multiline?: boolean;    // textarea vs input
  placeholder?: string;
}

// maps names (named it "type" here since it better matches the purpose) to builder components
export interface BuilderComponent {
  type: string;
  label: string;
  group: "text" | "media" | "buttons" | "dividers";
  defaultData?: any;
  render(data: any): TemplateResult;
  settings?: (element: HTMLElement) => TemplateResult;

  // declarative editable fields
  bindings?: ComponentBinding[];
}
