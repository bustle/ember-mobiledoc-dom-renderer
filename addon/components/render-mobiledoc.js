import { A } from '@ember/array';
import Component from '@glimmer/component';
import { join } from '@ember/runloop';
import Ember from 'ember';
import Renderer from 'ember-mobiledoc-dom-renderer';
import { RENDER_TYPE } from 'ember-mobiledoc-dom-renderer';
import { getDocument } from 'ember-mobiledoc-dom-renderer/utils/document';
import assign from 'ember-mobiledoc-dom-renderer/utils/polyfilled-assign';

const {
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

export default class extends Component {
  _teardownRender;

  // pass in an array of card names that the mobiledoc may have. These
  // map to component names using `cardNameToComponentName`
  get cardNames() {
    return this.args.cardNames || [];
  }

  // pass in an array of atom names that the mobiledoc may have. These
  // map to component names using `atomNameToComponentName`
  get atomNames() {
    return this.args.atomNames || [];
  }

  get mdcCards() {
    return this.cardNames.map(createComponentCard);
  }

  get mdcAtoms() {
    return this.atomNames.map(createComponentAtom);
  }

  get renderedMobiledoc() {
    if (this._teardownRender) {
      this._teardownRender();
      this._teardownRender = null;
    }

    let dom = getDocument(this);
    let { mobiledoc } = this.args;
    let renderer = new Renderer(this._buildRendererOptions(dom));
    let { result, teardown } = renderer.render(mobiledoc);

    // result is a document fragment, and glimmer2 errors when cleaning it up.
    // We must append the document fragment to a static wrapper.
    // Related: https://github.com/tildeio/glimmer/pull/331 and
    //          https://github.com/yapplabs/ember-wormhole/issues/66#issuecomment-246207622
    let wrapper = this._createElement(dom, 'div');
    wrapper.appendChild(result);

    this._teardownRender = teardown;
    return wrapper;
  }

  _buildRendererOptions(dom) {
    let options = {
      dom,
      cards: this.mdcCards,
      atoms: this.mdcAtoms,
    };
    [
      'mobiledoc', 'sectionElementRenderer', 'markupElementRenderer',
       'unknownCardHandler', 'unknownAtomHandler'
    ].forEach(option => {
      let value = this.args[option];
      if (value) {
        options[option] = value;
      }
    });

    let passedOptions = this.args.cardOptions;
    let cardOptions = this._cardOptions;
    cardOptions = passedOptions ? assign(passedOptions, cardOptions) : cardOptions;
    options.cardOptions = cardOptions;
    return options;
  }

  get _cardOptions() {
    return {
      [ADD_CARD_HOOK]: ({env, options, payload}) => {
        let { name: cardName, dom } = env;
        let classNames = [CARD_ELEMENT_CLASS, `${CARD_ELEMENT_CLASS}-${cardName}`];
        let element = this._createElement(dom, CARD_TAG_NAME, classNames);
        let componentName = this.cardNameToComponentName(cardName);

        let card = {
          componentName,
          destinationElement: element,
          payload,
          options
        };
        this.addCard(card);
        return { entity: card, element };
      },
      [ADD_ATOM_HOOK]: ({env, options, value, payload}) => {
        let { name: atomName, dom } = env;
        let classNames = [ATOM_ELEMENT_CLASS, `${ATOM_ELEMENT_CLASS}-${atomName}`];
        let element = this._createElement(dom, ATOM_TAG_NAME, classNames);
        let componentName = this.atomNameToComponentName(atomName);

        let atom = {
          componentName,
          destinationElement: element,
          payload,
          value,
          options
        };
        this.addAtom(atom);
        return { entity: atom, element };
      },
      [REMOVE_CARD_HOOK]: (card) => this.removeCard(card),
      [REMOVE_ATOM_HOOK]: (atom) => this.removeAtom(atom)
    };
  }

  willDestroy() {
    if (this._teardownRender) {
      this._teardownRender();
    }
    return super.willDestroy(...arguments);
  }

  // override in subclass to change the mapping of card name -> component name
  cardNameToComponentName(name) {
    return name;
  }

  // override in subclass to change the mapping of atom name -> component name
  atomNameToComponentName(name) {
    return name;
  }

  // @private

  _componentCards =  A();
  _componentAtoms = A();

  addCard(card) {
    this._componentCards.pushObject(card);
  }

  removeCard(card) {
    join(() => {
      this._componentCards.removeObject(card);
    });
  }

  addAtom(atom) {
    this._componentAtoms.pushObject(atom);
  }

  removeAtom(atom) {
    join(() => {
      this._componentAtoms.removeObject(atom);
    });
  }

  generateUuid() {
    return `${UUID_PREFIX}${uuid()}`;
  }

  _createElement(dom, tagName, classNames=[]) {
    let el = dom.createElement(tagName);
    el.setAttribute('id', this.generateUuid());
    el.setAttribute('class', classNames.join(' '));
    return el;
  }
}
