import { getOwner } from '@ember/application';

// Private Ember API usage. Get the dom implementation used by the current
// renderer, be it native browser DOM or Fastboot SimpleDOM
export function getDocument(context) {
  let documentService = getOwner(context).lookup('service:-document');
  if (!documentService) {
    throw new Error('ember-mobiledoc-dom-renderer could not get DOM');
  }
  return documentService;
}
