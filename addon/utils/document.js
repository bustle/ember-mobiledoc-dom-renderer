import { getOwner } from '@ember/application';

// Private Ember API usage. Get the dom implementation used by the current
// renderer, be it native browser DOM or Fastboot SimpleDOM
export function getDocument(context) {
  let container = getOwner ? getOwner(context) : context.container;
  let documentService = container.lookup('service:-document');

  if (documentService) { return documentService; }

  let renderer = container.lookup('renderer:-dom');

  if (renderer._dom && renderer._dom.document) { // pre Ember 2.6
    return renderer._dom.document;
  } else {
    throw new Error('ember-mobiledoc-dom-renderer could not get DOM');
  }
}
