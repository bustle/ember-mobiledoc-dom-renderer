// Enable Ember's stable types for editors and TypeScript consumers.
// See: https://blog.emberjs.com/stable-typescript-types-in-ember-5-1/
import 'ember-source/types';

// Minimal ambient module declarations for the addon's public modules.
// These provide lightweight typings to help consumers and editors.
declare module 'ember-mobiledoc-dom-renderer' {
  // The package re-exports the runtime mobiledoc-dom-renderer default export.
  // We intentionally keep the types loose here to avoid coupling to the
  // runtime package shape; consumers can import concrete types from
  // 'mobiledoc-dom-renderer' if they need stronger typing.
  export const RENDER_TYPE: unknown;
  const Renderer: unknown;
  export default Renderer;
}

declare module 'ember-mobiledoc-dom-renderer/components/render-mobiledoc' {
  import Component from '@glimmer/component';

  // Very small shape for the component. Consumers using the component in TS
  // can augment this declaration in their app if they need more specific types.
  export default class RenderMobiledocComponent extends Component<unknown> {}
}

declare module 'ember-mobiledoc-dom-renderer/mobiledoc-dom-renderer/index' {
  // This package path is used by the addon index and resolves to the
  // runtime mobiledoc-dom-renderer implementation at build time. Provide a
  // lightweight ambient declaration so TypeScript/Glint can resolve imports
  // during checks in this repository.
  export const RENDER_TYPE: unknown;
  const Renderer: unknown;
  export default Renderer;
}

// Test-only ambient modules -------------------------------------------------
declare module 'ember-cli-fastboot-testing/test-support' {
  export function setup(...args: unknown[]): unknown;
  export function visit(...args: unknown[]): unknown;
}

declare module 'dummy/app' {
  const Application: unknown;
  export default Application;
}
