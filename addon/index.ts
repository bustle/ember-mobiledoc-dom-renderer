// Re-export the runtime mobiledoc-dom-renderer package's default export and
// named exports. Importing directly from the runtime package makes the
// module resolution straightforward during type-checking and at runtime.
import Renderer, { RENDER_TYPE } from 'mobiledoc-dom-renderer';

export { RENDER_TYPE };
export default Renderer;
