import { TemplateResult } from "lit";

// maps names (named it "type" here since it better matches the purpose) to builder components
export interface BuilderComponent {
  type: string;
  label: string;
  group: "text" | "media" | "buttons" | "dividers";
  defaultData?: any;
  render(data: any): TemplateResult;
  settings?: (element: HTMLElement) => TemplateResult;
}
