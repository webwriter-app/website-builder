// The Lit localization CLI generates this JavaScript module.
declare module "*/locale-codes.js" {
  export const sourceLocale: string;
  export const targetLocales: readonly string[];
}

/** An event of a Shoelace input, select, switch or range: its target holds the value. */
type ControlEvent = Event & { target: HTMLInputElement; currentTarget: HTMLInputElement };

declare module "@webwriter/build/test" {
  export const getMochaConfig: () => Mocha.MochaOptions;
}
