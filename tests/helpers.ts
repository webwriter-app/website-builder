import snippet from "../snippets/flex-starter.html";
import type { WebwriterWebsiteBuilder } from "../src/widgets/webwriter-website-builder";

export const frame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

export async function until<T>(fn: () => T, what: string, timeout = 20000): Promise<NonNullable<T>> {
  const end = performance.now() + timeout;
  for (;;) {
    let value: T | undefined;
    try { value = fn(); } catch { value = undefined; }
    if (value) return value as NonNullable<T>;
    if (performance.now() > end) throw new Error("timed out waiting for " + what);
    await frame();
  }
}

export const block = (w: Element) => w.querySelector(':scope > script[type="application/json"][slot="data"]') as HTMLScriptElement;
export const data = (w: Element) => JSON.parse(block(w).textContent!);

export const stage = document.createElement("div");
document.body.append(stage);

export function setMode(w: Element, editing: boolean) {
  if (editing) { w.setAttribute("contenteditable", ""); document.designMode = "on"; }
  else { w.removeAttribute("contenteditable"); document.designMode = "off"; }
}

export async function mount(editing: boolean, transform: (html: string) => string = s => s): Promise<WebwriterWebsiteBuilder> {
  stage.innerHTML = transform(snippet);
  stage.querySelectorAll(".snippet-localization").forEach(e => e.remove());
  const w = stage.querySelector("webwriter-website-builder") as WebwriterWebsiteBuilder;
  setMode(w, editing);
  await until(() => w.shadowRoot?.querySelector(".canvas"), "the canvas");
  await w.updateComplete;
  return w;
}

export function cleanup() {
  stage.innerHTML = "";
  stage.removeAttribute("lang");
  document.designMode = "off";
}
