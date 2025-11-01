// Global test-only ambient module declarations.
// Kept separate from the ember types import so these declarations are always
// available as globals to the TypeScript language service.
declare module 'ember-cli-fastboot-testing/test-support' {
  export function setup(hooks: unknown): void;

  // Historically the test helper returns an object with `htmlDocument` and
  // `statusCode`; keep this flexible for now by using `any` so tests in this
  // repo and downstream consumers are not constrained by a narrow type.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function visit(path: string): Promise<any>;
}

declare module 'dummy/app' {
  // Minimal shape for the dummy Application used in tests
  class DummyApplication {
    static create(attrs?: Record<string, unknown>): unknown;
    setupForTesting(): void;
    injectTestHelpers(): void;
  }

  export default DummyApplication;
}
