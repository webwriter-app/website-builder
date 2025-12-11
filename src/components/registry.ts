import { BuilderComponent } from "../types/BuilderComponent";
import { ParagraphComponent } from "./text/paragraph";
import { Heading1 } from "./text/Heading1";

export const ComponentRegistry: Record<string, BuilderComponent> = {
  paragraph: ParagraphComponent,
  h1: Heading1,
};
