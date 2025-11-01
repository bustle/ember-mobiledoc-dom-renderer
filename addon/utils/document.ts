import { getOwner } from '@ember/application';

// Private Ember API usage. Get the dom implementation used by the current
// renderer, be it native browser DOM or Fastboot SimpleDOM
export function getDocument(context: object) {
  // getOwner can return undefined in some edge cases; use a minimal Owner-like
  // shape to call `lookup` safely without using `any`.
  type OwnerLike = { lookup?(name: string): unknown } | undefined;
  const owner = getOwner(context as object) as OwnerLike;
  const documentService = owner?.lookup && owner.lookup('service:-document');
  if (!documentService) {
    throw new Error('ember-mobiledoc-dom-renderer could not get DOM');
  }
  return documentService;
}
