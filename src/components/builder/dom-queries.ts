import type { LitElement } from "lit";

/** Whether the focus is on an element of the widget that accepts typing text. */
export function isEditingWithin(host: LitElement): boolean {
  const root = host.renderRoot as ShadowRoot;
  const ae =
    (root.activeElement as HTMLElement | null) ??
    (host.ownerDocument.activeElement as HTMLElement | null);
  if (!ae) return false;
  const inside =
    root.contains(ae) || host.contains(ae) || ae.getRootNode() === root;
  if (!inside) return false;
  if (ae.matches('input, textarea, select, [contenteditable="true"]'))
    return true;
  if (ae.closest("sl-input, sl-textarea, sl-select")) return true;
  return false;
}

const INTERACTIVE_SELECTOR = [
  "a",
  "button",
  "input",
  "textarea",
  "select",
  "[contenteditable='true']",
  "audio",
  "video",
  "summary",
  "details",
  "sl-input",
  "sl-textarea",
  "sl-select",
  "sl-button",
  "sl-icon-button",
  "sl-checkbox",
  "sl-switch",
  "sl-radio",
  "sl-range",
].join(", ");

/** Whether the event target is an element that needs a click for interaction. */
export function isInteractive(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest(INTERACTIVE_SELECTOR));
}
