import { buildDocument } from "./exporter";
import { validateBuilderState } from "./state-io";

/** The generated page as a standalone HTML file. */
export function htmlFile(html: string, css: string, lang = "en"): File {
  return new File([buildDocument(html, css, lang)], "website.html", { type: "text/html" });
}

/** A serialized builder state as a JSON file that `readStateFile` reads back. */
export function stateFile(serialized: string): File {
  return new File([JSON.stringify(JSON.parse(serialized), null, 2)], "website-builder.json", {
    type: "application/json",
  });
}

/** Reads and validates a builder state file; returns its text, or throws with the given message. */
export async function readStateFile(file: File, invalid: string): Promise<string> {
  const text = await file.text();
  if (!validateBuilderState(text)) throw new Error(invalid);
  return text;
}
