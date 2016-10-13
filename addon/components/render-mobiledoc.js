import Ember from 'ember';
import Renderer from 'ember-mobiledoc-dom-renderer';
import { RENDER_TYPE } from 'ember-mobiledoc-dom-renderer';
import layout from '../templates/components/render-mobiledoc';

const {
  assert,
  computed,
  run: { join },
  uuid
} = Ember;

const ADD_CARD_HOOK             = 'addComponentCard';
const REMOVE_CARD_HOOK          = 'removeComponentCard';
const ADD_ATOM_HOOK             = 'addComponentAtom';
const REMOVE_ATOM_HOOK          = 'removeComponentAtom';
const CARD_TAG_NAME             = 'div';
const ATOM_TAG_NAME             = 'span';
const UUID_PREFIX               = '__rendered-mobiledoc-entity-';
export const CARD_ELEMENT_CLASS = '__rendered-mobiledoc-card';
export const ATOM_ELEMENT_CLASS = '__rendered-mobiledoc-atom';

const CARD_HOOKS = {
  ADD:    ADD_CARD_HOOK,
  REMOVE: REMOVE_CARD_HOOK
};

const ATOM_HOOKS = {
  ADD:    ADD_ATOM_HOOK,
  REMOVE: REMOVE_ATOM_HOOK
};

function rendererFor(type) {
  let hookNames;

  if (type === 'card') {
    hookNames = CARD_HOOKS;
  } else if (type === 'atom') {
    hookNames = ATOM_HOOKS;
  }

  return function({env, options}) {
    let { onTeardown } = env;
    let addHook    = options[hookNames.ADD];
    let removeHook = options[hookNames.REMOVE];

    let { entity, element } = addHook(...arguments);
    onTeardown(() => removeHook(entity));

    return element;
  };
}

function createComponentCard(name) {
  return {
    name,
    type: RENDER_TYPE,
    render: rendererFor('card')
  };
}

function createComponentAtom(name) {
  return {
    name,
    type: RENDER_TYPE,
    render: rendererFor('atom')
  };
}

export default Ember.Component.extend({
  layout: layout,

  didReceiveAttrs() {
    let mobiledoc = this.get('mobiledoc');
    assert(`Must pass mobiledoc to render-mobiledoc component`, !!mobiledoc);
  },

  // pass in an array of card names that the mobiledoc may have. These
  // map to component names using `cardNameToComponentName`
  cardNames: [],

  // pass in an array of atom names that the mobiledoc may have. These
  // map to component names using `atomNameToComponentName`
  atomNames: [],

  _mdcCards: computed('cardNames', function() {
    return this.get('cardNames').map(name => createComponentCard(name));
  }),

  _mdcAtoms: computed('atomNames', function() {
    return this.get('atomNames').map(name => createComponentAtom(name));
  }),

  willRender() {
    /*
     We need to figure why this this is getting called after rendering
     the same payload somewhere else. Since the editor is destroyed
     and rendered again, wormhole goes into a weird state because it
     doesn't find the destination elements. Related with
     https://github.com/bustlelabs/ember-mobiledoc-dom-renderer/issues/19

     Also there is a a double render.
     */
    this.beginPropertyChanges();
    this.get('_componentCards').clear();
    this.get('_componentAtoms').clear();
    this.endPropertyChanges();

    let emberRenderer = this.get('renderer');
    let dom = emberRenderer && emberRenderer._dom;
    assert('Unable to get renderer dom helper', !!dom);

    let cards = this.get('_mdcCards');
    let atoms = this.get('_mdcAtoms');
    let mobiledoc = this.get('mobiledoc');
    let cardOptions = this.get('_cardOptions');

    let renderer = new Renderer({atoms, cards, cardOptions, dom});
    let { result, teardown } = renderer.render(mobiledoc);

    this.set('renderedMobiledoc', result);
    this._teardownRender = teardown;

    this._super(...arguments);
  },

  _cardOptions: computed(function() {
    return {
      [ADD_CARD_HOOK]: ({env, options, payload}) => {
        let { name: cardName, dom } = env;
        let classNames = [CARD_ELEMENT_CLASS, `${CARD_ELEMENT_CLASS}-${cardName}`];
        let element = this._createElement(dom, CARD_TAG_NAME, classNames);
        let componentName = this.cardNameToComponentName(cardName);

        let card = {
          componentName,
          destinationElementId: element.getAttribute('id'),
          payload
        };
        this.addCard(card);
        return { card, element };
      },
      [ADD_ATOM_HOOK]: ({env, options, value, payload}) => {
        let { name: atomName, dom } = env;
        let classNames = [ATOM_ELEMENT_CLASS, `${ATOM_ELEMENT_CLASS}-${atomName}`];
        let element = this._createElement(dom, ATOM_TAG_NAME, classNames);
        let componentName = this.atomNameToComponentName(atomName);

        let atom = {
          componentName,
          destinationElementId: element.getAttribute('id'),
          payload,
          value
        };
        this.addAtom(atom);
        return { atom, element };
      },
      [REMOVE_CARD_HOOK]: (card) => this.removeCard(card),
      [REMOVE_ATOM_HOOK]: (atom) => this.removeAtom(atom)
    };
  }),

  willDestroyElement() {
    // clean up cards and atoms so wormhole doesn't try to render
    // them after mobiledoc has been destroy
    this.beginPropertyChanges();
    this.get('_componentCards').clear();
    this.get('_componentAtoms').clear();
    this.endPropertyChanges();
    if (this._teardownRender) {
      this._teardownRender();
    }
    return this._super(...arguments);
  },

  // override in subclass to change the mapping of card name -> component name
  cardNameToComponentName(name) {
    return name;
  },

  // override in subclass to change the mapping of atom name -> component name
  atomNameToComponentName(name) {
    return name;
  },

  // @private

  _componentCards: computed(function() {
    return Ember.A();
  }),

  _componentAtoms: computed(function() {
    return Ember.A();
  }),

  addCard(card) {
    this.get('_componentCards').pushObject(card);
  },

  removeCard(card) {
    join(() => {
      this.get('_componentCards').removeObject(card);
    });
  },

  addAtom(atom) {
    this.get('_componentAtoms').pushObject(atom);
  },

  removeAtom(atom) {
    join(() => {
      this.get('_componentAtoms').removeObject(atom);
    });
  },

  generateUuid() {
    return `${UUID_PREFIX}${uuid()}`;
  },

  _createElement(dom, tagName, classNames=[]) {
    let el = dom.createElement(tagName);
    el.setAttribute('id', this.generateUuid());
    el.setAttribute('class', classNames.join(' '));
    return el;
  }
});
