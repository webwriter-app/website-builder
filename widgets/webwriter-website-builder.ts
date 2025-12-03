import {html, css} from "lit"
import {LitElementWw} from "@webwriter/lit"
import {customElement} from "lit/decorators.js"
import LOCALIZE from '../localization/generated'
import {msg} from '@lit/localize'


@customElement("webwriter-website-builder")
export class WebwriterWebsiteBuilder extends LitElementWw {

  localize = LOCALIZE
  msg = msg

  /** Register the classes of custom elements to use in the Shadow DOM here.
   * @example
   * import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js"
   * ...
   *   static scopedElements = {"sl-button": SlButton}
   **/
  static scopedElements = {}

  /** Put the styles for your Shadow DOM (what is rendered through render()) here. */
  static styles = css``

  /** Define your template here and return it. */
  render() {
    return html`Hello, world!!!!`
  }
}