/// <reference types="mocha" />
import "mocha/mocha.js";
import { assert } from "chai";
import { getMochaConfig } from "@webwriter/build/test";
import "../src/widgets/webwriter-website-builder";
import { block, cleanup, data, frame, mount, setMode, stage, until } from "./helpers";
import { moveNodeInOrder } from "../src/model/layout";
import validState from "./fixtures/website-builder.json";
import invalidState from "./fixtures/not-a-builder-file.json";

mocha.setup(getMochaConfig());

const keyEvent = (type: string, key: string) => new KeyboardEvent(type, { key, bubbles: true, composed: true, cancelable: true });

describe("<webwriter-website-builder>", function () {
  this.timeout(30000);
  afterEach(cleanup);

  describe("data block", function () {
    it("read mode applies the data block", async function () {
      const w = await mount(false);
      const expected = data(w).orderedNodes.length;
      await until(() => w.shadowRoot!.querySelector(".flex-root"), "the flex layout");
      assert.equal(w.layoutMode, "flex");
      assert.equal(w.shadowRoot!.querySelectorAll(".flex-root > .flow-item").length, expected, "top-level node count");
    });

    it("a change writes the block and keeps unknown keys, in edit mode", async function () {
      const w = await mount(true, s => s.replace('{"layoutMode"', '{"custom":{"keep":true},"layoutMode"'));
      const before = data(w).orderedNodes.length;
      assert.isTrue(data(w).custom?.keep === true, "the unknown key is in the block to begin with");
      w.selectNodeId(w.orderedNodes[0].id);
      w.deleteSelectedNode();
      await until(() => data(w).orderedNodes.length === before - 1, "the block to lose a node");
      assert.isTrue(data(w).custom?.keep === true, "the unknown key was lost");
      assert.equal(block(w).getAttribute("slot"), "data", "the block lost its slot");
      assert.equal(document.querySelectorAll("webwriter-website-builder > script").length, 1, "more than one block");
    });

    it("a change in read mode is written too", async function () {
      const w = await mount(false);
      w.updateNode(w.orderedNodes[0].id, { display: "inline" });
      await until(() => data(w).orderedNodes[0].display === "inline", "the block to follow");
    });

    it("an external change of the block is applied", async function () {
      const w = await mount(true);
      const next = { layoutMode: "freeform", freeformNodes: [
        { id: "a", type: "label", data: { content: "A" }, pos: { x: 10, y: 10 }, order: 0, display: "block" },
        { id: "b", type: "label", data: { content: "B" }, pos: { x: 40, y: 40 }, order: 1, display: "block" }], orderedNodes: [] };
      block(w).textContent = JSON.stringify(next);
      await until(() => w.shadowRoot!.querySelectorAll(".freeform-root > .builder-element").length === 2, "two freeform nodes");
      assert.equal(w.layoutMode, "freeform");
      // The applied state is not written back as a change of its own.
      const text = block(w).textContent;
      await w.updateComplete; await frame(); await frame();
      assert.equal(block(w).textContent, text, "the block was rewritten after it was applied");
    });

    it("removing the block restores the default state", async function () {
      const w = await mount(true);
      block(w).remove();
      await until(() => w.shadowRoot!.querySelector(".drop-zone"), "the empty canvas");
      assert.equal(w.layoutMode, "freeform");
    });

    it("a legacy block with nodes is read", async function () {
      const w = await mount(false, s => s.replace(/"orderedNodes":/, '"nodes":'));
      await until(() => w.shadowRoot!.querySelector(".flex-root > .flow-item"), "legacy nodes rendered");
    });
  });

  describe("modes", function () {
    it("edit mode shows the settings dialog and follows a mode change", async function () {
      const w = await mount(false);
      assert.isNotOk(w.shadowRoot!.querySelector("#builder-settings"), "dialog in read mode");
      assert.isTrue(w.isStudentMode() && !w.isAuthorMode(), "read mode answers");
      setMode(w, true);
      await until(() => w.shadowRoot!.querySelector("#builder-settings"), "the dialog after the switch");
      assert.isTrue(w.isAuthorMode() && !w.isStudentMode(), "edit mode answers");
      setMode(w, false);
      await until(() => !w.shadowRoot!.querySelector("#builder-settings"), "the dialog to go");
    });

    it("student mode keeps delete blocked, author mode may delete", async function () {
      const w = await mount(false);
      const press = () => w.shadowRoot!.querySelector(".layout")!.dispatchEvent(keyEvent("keydown", "Delete"));
      w.selectNodeId(w.orderedNodes[0].id);
      const n = w.orderedNodes.length;
      press();
      assert.equal(w.orderedNodes.length, n, "deleted in student mode");
      setMode(w, true);
      await until(() => w.isAuthorMode(), "edit mode");
      press();
      assert.equal(w.orderedNodes.length, n - 1, "not deleted in author mode");
    });
  });

  describe("keyboard", function () {
    it("keys reach the widget only from inside, and stop with its removal", async function () {
      const w = await mount(false);
      const layout = w.shadowRoot!.querySelector(".layout")!;
      const key = (type: string, k: string, target: EventTarget = layout) => target.dispatchEvent(keyEvent(type, k));
      w.selectNodeId(w.orderedNodes[0].id);
      key("keydown", "g"); await w.updateComplete;
      assert.isOk(w.shadowRoot!.querySelector(".grid-overlay"), "grid overlay while G is held");
      key("keyup", "g"); await w.updateComplete;
      assert.isNotOk(w.shadowRoot!.querySelector(".grid-overlay"), "grid overlay after G is released");
      key("keydown", "Escape");
      assert.isNotOk(w.selectedNodeId, "Escape clears the selection");
      w.selectNodeId(w.orderedNodes[0].id);
      key("keydown", "Escape", document.body);
      assert.isOk(w.selectedNodeId, "a key from the page leaves the widget alone");
      w.remove();
      key("keydown", "g", document.body); await w.updateComplete;
      assert.isNotOk(w.gridKeyPressed, "no key after the widget left the document");
    });
  });

  describe("keyboard and pointer input", function () {
    const nodes = (w: Element) => [...w.shadowRoot!.querySelectorAll<HTMLElement>(".flex-root > .flow-item")];
    const labels = async (w: any) => {
      const list = ["A", "B", "C"].map((t, i) => ({ id: "n" + i, type: "label", data: { content: t }, order: i, display: "block" }));
      block(w).textContent = JSON.stringify({ layoutMode: "flex", freeformNodes: [], orderedNodes: list });
      await until(() => nodes(w).length === 3, "three nodes");
    };

    it("placed elements are tab stops with a name, and Enter selects them", async function () {
      const w = await mount(false);
      await labels(w);
      const first = nodes(w)[0];
      assert.equal(first.getAttribute("tabindex"), "0", "tab stop");
      assert.isAbove(first.getAttribute("aria-label")!.length, 0, "accessible name");
      first.dispatchEvent(keyEvent("keydown", "Enter"));
      assert.equal(w.selectedNodeId, first.dataset.nodeId, "Enter selects");
      await w.updateComplete;
      assert.equal(first.getAttribute("aria-current"), "true");
      w.clearSelection();
      first.dispatchEvent(keyEvent("keydown", " "));
      assert.equal(w.selectedNodeId, first.dataset.nodeId, "Space selects");
    });

    it("Alt with an arrow key moves the selection one place in ordered layouts", async function () {
      const w = await mount(false);
      await labels(w);
      const ids = () => nodes(w).map(n => n.dataset.nodeId);
      const before = ids();
      assert.isAbove(before.length, 1);
      w.selectNodeId(before[0]!);
      const press = (key: string, alt = true) => w.shadowRoot!.querySelector(".layout")!.dispatchEvent(
        new KeyboardEvent("keydown", { key, altKey: alt, bubbles: true, composed: true, cancelable: true }));
      press("ArrowDown"); await w.updateComplete;
      assert.deepEqual(ids().slice(0, 2), [before[1], before[0]], "moved later");
      press("ArrowUp"); await w.updateComplete;
      assert.deepEqual(ids(), before, "moved earlier again");
      press("ArrowUp"); await w.updateComplete;
      assert.deepEqual(ids(), before, "the first node stays first");
    });

    it("moveNodeInOrder reaches nested lists and refuses the ends", function () {
      const leaf = (id: string, order: number) => ({ id, type: "label", data: {}, order });
      const tree = [{ ...leaf("c", 0), isContainer: true, children: [leaf("x", 0), leaf("y", 1)] }, leaf("z", 1)];
      const next = moveNodeInOrder(tree, "x", 1)!;
      assert.equal(next[0].children!.find(n => n.id === "x")!.order, 1);
      assert.isNull(moveNodeInOrder(tree, "y", 1), "last stays last");
      assert.isNull(moveNodeInOrder(tree, "missing", 1));
    });

    it("a touch pointer selects an element, and Escape closes the add menu first", async function () {
      const w = await mount(false);
      await labels(w);
      const target = nodes(w)[1];
      target.dispatchEvent(new PointerEvent("pointerdown", { pointerType: "touch", pointerId: 7, isPrimary: true, bubbles: true, composed: true, clientX: 20, clientY: 20 }));
      window.dispatchEvent(new PointerEvent("pointerup", { pointerType: "touch", pointerId: 7, bubbles: true }));
      assert.equal(w.selectedNodeId, target.dataset.nodeId, "touch selects");
      w.toolbarOpen = true;
      await w.updateComplete;
      w.shadowRoot!.querySelector(".layout")!.dispatchEvent(keyEvent("keydown", "Escape"));
      assert.isFalse(w.toolbarOpen, "menu closed");
      assert.equal(w.selectedNodeId, target.dataset.nodeId, "selection stays");
    });
  });

  describe("presentation", function () {
    it("follows the document theme", async function () {
      stage.style.cssText = "--ww-text-color: rgb(10, 20, 30); --ww-font-family: Georgia, serif; --ww-theme-accent-1: rgb(200, 50, 60)";
      const w = await mount(false);
      const cs = getComputedStyle(w);
      assert.equal(cs.color, "rgb(10, 20, 30)");
      assert.match(cs.fontFamily, /Georgia/);
      w.selectNodeId(w.orderedNodes[0].id);
      await w.updateComplete;
      const selected = w.shadowRoot!.querySelector<HTMLElement>(".builder-element.selected")!;
      assert.equal(getComputedStyle(selected).outlineColor, "rgb(200, 50, 60)", "selection ring uses the accent");
      w.toolbarOpen = false; await w.updateComplete;
      const toggle = w.shadowRoot!.querySelector<HTMLElement>(".toolbar-toggle")!;
      assert.equal(getComputedStyle(toggle).backgroundColor, "rgb(200, 50, 60)", "toolbar uses the accent");
      stage.style.cssText = "";
    });

    it("keeps the host within 300 and 2100 pixels and exposes parts", async function () {
      const w = await mount(false);
      stage.style.width = "200px";
      assert.isAtLeast(w.getBoundingClientRect().width, 300, "minimum width");
      stage.style.width = "3000px";
      assert.isAtMost(w.getBoundingClientRect().width, 2102, "maximum width");
      stage.style.width = "";
      assert.isOk(w.shadowRoot!.querySelector(".canvas[part~=canvas]"), "canvas part");
    });

    it("an empty canvas has a print note", async function () {
      const w = await mount(false);
      block(w).textContent = JSON.stringify({ layoutMode: "flex", freeformNodes: [], orderedNodes: [] });
      await until(() => w.shadowRoot!.querySelector(".drop-zone"), "the empty canvas");
      assert.isOk(w.shadowRoot!.querySelector(".print-note"));
      assert.equal(getComputedStyle(w.shadowRoot!.querySelector(".print-note")!).display, "none", "hidden on screen");
    });
  });

  describe("localization", function () {
    it("the language follows lang, for the widget and for the icon picker", async function () {
      const w = await mount(true);
      const hint = () => w.shadowRoot!.querySelector("#builder-settings kbd")?.parentElement?.textContent ?? "";
      assert.match(hint(), /Hold/, "English first");
      const picker = document.createElement("ww-icon-picker", { customElementRegistry: (w as any).registry }) as any;
      w.shadowRoot!.querySelector(".layout")!.append(picker);
      await picker.updateComplete;
      const label = () => picker.shadowRoot.querySelector("sl-button, button")?.textContent.trim() ?? "";
      const english = label();
      assert.isAbove(english.length, 0, "picker has a label");
      let events = 0; w.addEventListener("optionschange", () => events++);
      w.setAttribute("lang", "de");
      await until(() => /gedrückt halten/.test(hint()), "German hint");
      await until(() => label() !== english, "German picker label");
      assert.isAbove(events, 0, "no optionschange after the language change");
      assert.equal(w.localize.getLocale(), "de");
      w.setAttribute("lang", "en");
      await until(() => /Hold/.test(hint()), "English again");
      await until(() => label() === english, "English picker label");
    });

    it("inherited lang from an ancestor is used", async function () {
      stage.setAttribute("lang", "de");
      const w = await mount(true);
      await until(() => /gedrückt halten/.test(w.shadowRoot!.querySelector("#builder-settings kbd")?.parentElement?.textContent ?? ""), "German from the ancestor");
    });
  });

  describe("conversions and signals", function () {
    const asFile = (value: unknown) => new File([JSON.stringify(value)], "state.json", { type: "application/json" });
    const convert = (w: any, key: string) => (w.constructor as any).convertTo[key];

    it("declares the formats it implements", async function () {
      const w = await mount(false) as any;
      for (const key of Object.keys(w.constructor.convertTo)) assert.isFunction(w[w.constructor.convertTo[key]], key);
      for (const key of Object.keys(w.constructor.convertFrom)) assert.isFunction(w[w.constructor.convertFrom[key]], key);
    });

    it("exports the page as an HTML document", async function () {
      const w = await mount(false) as any;
      const file: File = await w[convert(w, "text/html")]();
      assert.equal(file.type, "text/html");
      assert.match(file.name, /\.html$/);
      const text = await file.text();
      assert.include(text, "<!doctype html>");
      assert.include(text, "page--flex");
      assert.include(text, "<style>");
    });

    it("imports a valid file only when the apply function runs", async function () {
      const w = await mount(true) as any;
      const before = w.orderedNodes.length;
      const apply = await w.importJson(asFile(validState));
      assert.equal(w.orderedNodes.length, before, "changed before apply");
      apply();
      assert.equal(w.layoutMode, "flow");
      assert.equal(w.orderedNodes.length, 2);
      assert.equal(w.canvasBackground, "#ffeedd");
      await until(() => data(w).orderedNodes.length === 2, "the block to follow the import");
    });

    it("refuses a file that is not a builder file", async function () {
      const w = await mount(true) as any;
      const before = w.orderedNodes.length;
      for (const bad of [invalidState, [1, 2], { orderedNodes: [{ id: 3 }] }]) {
        let message = "";
        try { await w.importJson(asFile(bad)); } catch (error) { message = (error as Error).message; }
        assert.isAbove(message.length, 0, JSON.stringify(bad));
      }
      let text = "";
      try { await w.importJson(new File(["{nope"], "x.json")); } catch (error) { text = (error as Error).message; }
      assert.isAbove(text.length, 0, "invalid JSON");
      assert.equal(w.orderedNodes.length, before, "the widget changed");
    });

    it("export then import gives the same state", async function () {
      const w = await mount(true) as any;
      const file: File = await w.exportJson();
      assert.equal(file.type, "application/json");
      const exported = await file.text();
      const state = JSON.parse(exported);
      const apply = await w.importJson(file);
      w.setActiveNodes([]);
      w.layoutMode = "grid";
      apply();
      assert.deepEqual(JSON.parse(w._serializeState()), state);
    });

    it("publishes the generated markup as a signal", async function () {
      const w = await mount(true) as any;
      await until(() => w.signals.html.get().includes("page--flex"), "the html signal");
      assert.strictEqual(w.signals.html, w.signals.html, "stable instance");
      w.setActiveNodes([]);
      await until(() => !w.signals.html.get().includes('class="el"'), "the signal to follow a change");
    });

    it("the html signal is empty while disconnected and returns on reconnect", async function () {
      const w = await mount(true) as any;
      const signal = w.signals.html;
      await until(() => signal.get().includes("page--flex"), "the html signal");
      const parent = w.parentElement as HTMLElement;
      w.remove();
      assert.equal(signal.get(), "");
      parent.append(w);
      await until(() => signal.get().includes("page--flex"), "the signal after reconnecting");
      assert.strictEqual(w.signals.html, signal, "stable instance");
    });

    it("exports the page with the language of the host", async function () {
      stage.setAttribute("lang", "de");
      const w = await mount(false) as any;
      const text = await (await w.exportHtml()).text();
      assert.include(text, '<html lang="de">');
    });
  });
});

mocha.run();
