/// <reference types="mocha" />
import "mocha/mocha.js";
import { assert } from "chai";
import { getMochaConfig } from "@webwriter/build/test";
import "../src/widgets/webwriter-website-builder";
import { block, cleanup, data, frame, mount, setMode, stage, until } from "./helpers";

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
});

mocha.run();
