import { BuilderComponent } from "./builder-component";
import { ParagraphComponent } from "./text/paragraph";
import { LabelComponent } from "./text/label";
import { ImageComponent } from "./media/image";
import { VideoComponent } from "./media/video";
import { AudioComponent } from "./media/audio";
import { Heading1 } from "./text/heading-1";
import { Heading2 } from "./text/heading-2";
import { Heading3 } from "./text/heading-3";
import { Heading4 } from "./text/heading-4";
import { Heading5 } from "./text/heading-5";
import { Heading6 } from "./text/heading-6";
import { TextareaComponent } from "./text/textarea";
import { ButtonComponent } from "./buttons/button";
import { LinkComponent } from "./buttons/link";
import { DividerComponent } from "./dividers/divider";
import { IconComponent } from "./media/icon";

export const ComponentRegistry: Record<string, BuilderComponent> = {
  paragraph: ParagraphComponent,
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  h4: Heading4,
  h5: Heading5,
  h6: Heading6,
  label: LabelComponent,
  image: ImageComponent,
  video: VideoComponent,
  audio: AudioComponent,
  icon: IconComponent,
  button: ButtonComponent,
  link: LinkComponent,
  divider: DividerComponent,
  textarea: TextareaComponent,
};
