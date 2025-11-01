const MOBILEDOC_VERSION = '0.3.1';

export function createSimpleMobiledoc(text) {
  return {
    version: MOBILEDOC_VERSION,
    markups: [],
    atoms: [],
    cards: [],
    sections: [[1, 'P', [[0, [], 0, text]]]],
  };
}

export function createMobiledocWithStrongMarkup(text) {
  return {
    version: MOBILEDOC_VERSION,
    markups: [['STRONG']],
    atoms: [],
    cards: [],
    sections: [[1, 'P', [[0, [0], 1, text]]]],
  };
}

export function createMobiledocWithAtom(atomName) {
  return {
    version: MOBILEDOC_VERSION,
    markups: [],
    atoms: [[atomName, 'value', { foo: 'bar' }]],
    cards: [],
    sections: [[1, 'P', [[1, [], 0, 0]]]],
  };
}

export function createMobiledocWithCard(cardName) {
  return {
    version: MOBILEDOC_VERSION,
    markups: [],
    atoms: [],
    cards: [[cardName, { foo: 'bar' }]],
    sections: [[10, 0]],
  };
}

export function createMobiledocWithLink(url, text) {
  const display = typeof text === 'undefined' ? url : text;
  return {
    version: MOBILEDOC_VERSION,
    markups: [['A', ['href', url]]],
    atoms: [],
    cards: [],
    // paragraph with a text marker that opens the link markup (markup index 0)
    sections: [[1, 'P', [[0, [0], 1, display]]]],
  };
}
