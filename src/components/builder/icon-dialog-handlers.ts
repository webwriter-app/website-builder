import type SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.js";
import type { WebwriterWebsiteBuilder } from "../../widgets/webwriter-website-builder";

/** Handlers of the icon dialog: scroll tracking, opening on request of an icon picker. */
export class IconDialogHandlers {
  constructor(private host: WebwriterWebsiteBuilder) {}

  /** Executed after the icon dialog is opened */
  afterShow = (e: Event) => {
    const dlg = e.target as HTMLElement;
    this.host.iconScroller = dlg.querySelector("#ww-icon-scroller");
    if (!this.host.iconScroller) return;
    this.host.iconScrollTop = this.host.iconScroller.scrollTop;
    this.host.iconViewportH = this.host.iconScroller.clientHeight;
    this.host.iconScroller.addEventListener("scroll", this.onScroll, {
      passive: true,
    });
    queueMicrotask(() =>
      dlg.querySelector<HTMLElement>("#ww-icon-search")?.focus(),
    );
  };

  /** Executed after the icon dialog is closed */
  afterHide = () => {
    this.host.iconScroller?.removeEventListener("scroll", this.onScroll);
    this.host.iconScroller = null;
    this.host.iconDialogTarget = null;
    this.host.iconDialogOpen = false;
  };

  private onScroll = () => {
    if (!this.host.iconScroller) return;
    this.host.iconScrollTop = this.host.iconScroller.scrollTop;
    this.host.iconViewportH = this.host.iconScroller.clientHeight;
    this.host.requestUpdate();
  };

  onPickerOpen = (e: Event) => {
    e.stopPropagation();
    const detail = (e as CustomEvent<{ name?: string; color?: string }>).detail;
    const picker = e
      .composedPath()
      .find((n) => n instanceof Element && n.localName === "ww-icon-picker");

    this.host.iconDialogTarget = picker ?? e.target;
    this.host.iconDraftName = detail?.name ?? "gear";
    this.host.iconDraftColor = detail?.color ?? "#0f172a";
    this.host.iconQuery = "";
    this.host.iconDialogOpen = true;
    if (!this.host.iconNames.length) {
      import("../../assets/shoelace-icon-names.json").then((m) => {
        this.host.iconNames = m.default;
      });
    }

    this.host.updateComplete.then(() => {
      this.host.renderRoot.querySelector<SlDialog>("#ww-icon-dialog")?.show();
    });
  };
}
