import { BuilderComponent } from "../types/BuilderComponent";
import { ParagraphComponent } from "./text/paragraph";
import { Heading1 } from "./text/Heading1";
import { Heading2 } from "./text/Heading2";
import { Heading3 } from "./text/Heading3";
import { Heading4 } from "./text/Heading4";
import { Heading5 } from "./text/Heading5";
import { Heading6 } from "./text/Heading6";

export const ComponentRegistry: Record<string, BuilderComponent> = {
  paragraph: ParagraphComponent,
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  h4: Heading4,
  h5: Heading5,
  h6: Heading6
};
