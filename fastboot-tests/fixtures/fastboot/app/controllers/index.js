import Ember from 'ember';
import {
  createSimpleMobiledoc,
  createMobiledocWithMarkup
} from '../utils/mobiledoc';

const mobiledocs = [
  {
    name: 'simple',
    mobiledoc: createSimpleMobiledoc('hello world')
  },
  {
    name: 'with-markup',
    mobiledoc: createMobiledocWithMarkup('markup text', ['em'])
  },
  {
    name: 'with-link',
    mobiledoc: createMobiledocWithMarkup('linked', ['a', ['href', 'http://example.com/with-link']])
  },
  {
    name: 'with-unsafe-link',
    mobiledoc: createMobiledocWithMarkup('linked unsafe', ['a', ['href', 'javascript:evil']])
  }
];

export default Ember.Controller.extend({
  mobiledocs
});
