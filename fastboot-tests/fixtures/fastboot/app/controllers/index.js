import Ember from 'ember';
import {
  createSimpleMobiledoc,
  createMobiledocWithMarkup,
  createMobiledocWithCard,
  createMobiledocWithAtom
} from '../utils/mobiledoc';

const mobiledocs = [
  {
    name: 'simple',
    mobiledoc: createSimpleMobiledoc('hello world'),
    cardNames: [],
    atomNames: []
  },
  {
    name: 'with-markup',
    mobiledoc: createMobiledocWithMarkup('markup text', ['em']),
    cardNames: [],
    atomNames: []
  },
  {
    name: 'with-link',
    mobiledoc: createMobiledocWithMarkup('linked', ['a', ['href', 'http://example.com/with-link']]),
    cardNames: [],
    atomNames: []
  },
  {
    name: 'with-unsafe-link',
    mobiledoc: createMobiledocWithMarkup('linked unsafe', ['a', ['href', 'javascript:evil']]),
    cardNames: [],
    atomNames: []
  },
  {
    name: 'card',
    mobiledoc: createMobiledocWithCard('test-card'),
    cardNames: ['test-card'],
    atomNames: []
  },
  {
    name: 'atom',
    mobiledoc: createMobiledocWithAtom('test-atom'),
    cardNames: [],
    atomNames: ['test-atom']
  }
];

export default Ember.Controller.extend({
  mobiledocs
});
