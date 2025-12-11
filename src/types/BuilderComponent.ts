import { TemplateResult } from "lit";


// maps names (named it "type" here since it better matches the purpose) to builder components
export interface BuilderComponent {
    type: string;
    render: (data?: unknown) => TemplateResult;

    // optional default model data
    defaultData?: unknown;
}