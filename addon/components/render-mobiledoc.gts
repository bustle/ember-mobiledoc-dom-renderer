import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { scheduleOnce } from '@ember/runloop';
import Renderer from 'ember-mobiledoc-dom-renderer';
import { getDocument } from 'ember-mobiledoc-dom-renderer/utils/document';
import { guidFor } from '@ember/object/internals';
import { ensureSafeComponent } from '@embroider/util';
import { getOwner } from '@ember/application';

const ADD_CARD_HOOK = 'addComponentCard';
const REMOVE_CARD_HOOK = 'removeComponentCard';
const ADD_ATOM_HOOK = 'addComponentAtom';
const REMOVE_ATOM_HOOK = 'removeComponentAtom';
const CARD_TAG_NAME = 'div';
const ATOM_TAG_NAME = 'span';
const UUID_PREFIX = '__rendered-mobiledoc-entity-';
export const CARD_ELEMENT_CLASS = '__rendered-mobiledoc-card';
export const ATOM_ELEMENT_CLASS = '__rendered-mobiledoc-atom';

let counter = 0;

const CARD_HOOKS = {
  ADD: ADD_CARD_HOOK,
  REMOVE: REMOVE_CARD_HOOK,
} as const;

const ATOM_HOOKS = {
  ADD: ADD_ATOM_HOOK,
  REMOVE: REMOVE_ATOM_HOOK,
} as const;

type CardRegistration = {
  componentName: string;
  componentDefinition: unknown;
  destinationElement: Element;
  payload: unknown;
  options: unknown;
};

type AtomRegistration = CardRegistration & {
  value: unknown;
};

type RenderMobiledocArgs = {
  mobiledoc: unknown;
  cardNames?: string[];
  atomNames?: string[];
  cardNameToComponentName?: (cardName: string) => string;
  atomNameToComponentName?: (atomName: string) => string;
  cardOptions?: Record<string, unknown>;
  sectionElementRenderer?: unknown;
  markupElementRenderer?: unknown;
  unknownCardHandler?: unknown;
  unknownAtomHandler?: unknown;
  onWillDestroy?: () => void;
};

type HookArgs = [
  {
    env: {
      name: string;
      dom: {
        createElement(tagName: string): HTMLElement;
      };
      onTeardown(callback: () => void): void;
    };
    options: Record<string, unknown>;
    payload?: unknown;
    value?: unknown;
  },
  ...unknown[],
];

function rendererFor(type: 'card' | 'atom') {
  const hookNames = type === 'card' ? CARD_HOOKS : ATOM_HOOKS;

  return (...args: HookArgs): Element => {
    const [{ env, options }] = args;
    const addHook = (options as any)[hookNames.ADD];
    const removeHook = (options as any)[hookNames.REMOVE];
    if (typeof addHook !== 'function' || typeof removeHook !== 'function') {
      throw new Error(
        `ember-mobiledoc-dom-renderer: missing hooks for ${type}. Have add: ${typeof addHook}, remove: ${typeof removeHook}`,
      );
    }

    const { entity, element } = addHook(...args);
    env.onTeardown(() => removeHook(entity));

    return element;
  };
}

function createComponentCard(name: string) {
  return {
    name,
    type: 'dom' as const,
    render: rendererFor('card'),
  };
}

function createComponentAtom(name: string) {
  return {
    name,
    type: 'dom' as const,
    render: rendererFor('atom'),
  };
}

export default class RenderMobiledocComponent extends Component<RenderMobiledocArgs> {
  @tracked private componentCardsStore: CardRegistration[] = [];
  @tracked private componentAtomsStore: AtomRegistration[] = [];
  private teardownRender: (() => void) | null = null;

  get owner() {
    return getOwner(this);
  }

  private resolveComponentDefinition = (name: string) => {
    const owner = this.owner as any;
    // Try as a component factory first (for class-based components and template-only via auto-generated factory)
    const factory = owner.factoryFor?.(`component:${name}`);
    if (factory) {
      const klass = factory.class;
      return ensureSafeComponent(klass, owner);
    }
    // Fall back to direct lookup for template-only components
    const component = owner.lookup?.(`component:${name}`);
    if (component) {
      return ensureSafeComponent(component, owner);
    }
    // Try pod-style template lookup - return template directly for template-only components
    const template = owner.lookup?.(`template:components/${name}/template`);
    if (template) {
      return template;
    }
    throw new Error(
      `ember-mobiledoc-dom-renderer: component not found: ${name}`,
    );
  };

  get cardNames(): string[] {
    return this.args.cardNames ?? [];
  }

  get atomNames(): string[] {
    return this.args.atomNames ?? [];
  }

  get mdcCards() {
    return this.cardNames.map(createComponentCard);
  }

  get mdcAtoms() {
    return this.atomNames.map(createComponentAtom);
  }

  protected get componentCards(): CardRegistration[] {
    return this.componentCardsStore;
  }

  protected get componentAtoms(): AtomRegistration[] {
    return this.componentAtomsStore;
  }

  get renderedMobiledoc(): HTMLElement {
    if (this.teardownRender) {
      this.teardownRender();
      this.teardownRender = null;
    }

    // Reset stores before rendering, but do not mutate them again until after render completes
    this.componentCardsStore = [];
    this.componentAtomsStore = [];

    const dom = getDocument(this) as {
      createElement(tagName: string): HTMLElement;
    };
    const renderer = new Renderer(this.buildRendererOptions(dom));
    const { result, teardown } = renderer.render(this.args.mobiledoc);

    const wrapper = this.createElement(dom, 'div');
    wrapper.appendChild(result);

    // Ensure any queued updates happen after we finish computing this getter
    scheduleOnce('afterRender', this, this.noop);

    this.teardownRender = teardown;
    return wrapper;
  }

  willDestroy(): void {
    if (this.teardownRender) {
      this.teardownRender();
      this.teardownRender = null;
    }
    super.willDestroy();
  }

  cardNameToComponentName(name: string): string {
    if (this.args.cardNameToComponentName) {
      return this.args.cardNameToComponentName(name);
    }
    return name;
  }

  atomNameToComponentName(name: string): string {
    if (this.args.atomNameToComponentName) {
      return this.args.atomNameToComponentName(name);
    }
    return name;
  }

  private get cardOptions() {
    return {
      [ADD_CARD_HOOK]: ({
        env,
        options,
        payload,
      }: {
        env: {
          name: string;
          dom: { createElement(tagName: string): HTMLElement };
        };
        options: unknown;
        payload: unknown;
      }) => {
        const { name: cardName, dom } = env;
        const classNames = [
          CARD_ELEMENT_CLASS,
          `${CARD_ELEMENT_CLASS}-${cardName}`,
        ];
        const element = this.createElement(dom, CARD_TAG_NAME, classNames);
        const componentName = this.cardNameToComponentName(cardName);
        const componentDefinition =
          this.resolveComponentDefinition(componentName);

        const card: CardRegistration = {
          componentName,
          componentDefinition,
          destinationElement: element,
          payload,
          options,
        };
        this.addCard(card);
        return { entity: card, element };
      },
      [ADD_ATOM_HOOK]: ({
        env,
        options,
        payload,
        value,
      }: {
        env: {
          name: string;
          dom: { createElement(tagName: string): HTMLElement };
        };
        options: unknown;
        payload: unknown;
        value: unknown;
      }) => {
        const { name: atomName, dom } = env;
        const classNames = [
          ATOM_ELEMENT_CLASS,
          `${ATOM_ELEMENT_CLASS}-${atomName}`,
        ];
        const element = this.createElement(dom, ATOM_TAG_NAME, classNames);
        const componentName = this.atomNameToComponentName(atomName);
        const componentDefinition =
          this.resolveComponentDefinition(componentName);

        const atom: AtomRegistration = {
          componentName,
          componentDefinition,
          destinationElement: element,
          payload,
          value,
          options,
        };
        this.addAtom(atom);
        return { entity: atom, element };
      },
      [REMOVE_CARD_HOOK]: (card: CardRegistration) => this.removeCard(card),
      [REMOVE_ATOM_HOOK]: (atom: AtomRegistration) => this.removeAtom(atom),
    };
  }

  private buildRendererOptions(dom: {
    createElement(tagName: string): HTMLElement;
  }) {
    const options: Record<string, unknown> = {
      dom,
      cards: this.mdcCards,
      atoms: this.mdcAtoms,
    };

    [
      'mobiledoc',
      'sectionElementRenderer',
      'markupElementRenderer',
      'unknownCardHandler',
      'unknownAtomHandler',
    ].forEach((optionName) => {
      const value = (this.args as Record<string, unknown>)[optionName];
      if (value !== undefined) {
        options[optionName] = value;
      }
    });

    const passedOptions = this.args.cardOptions ?? {};
    options.cardOptions = {
      ...passedOptions,
      ...this.cardOptions,
    };

    return options;
  }

  private addCard(card: CardRegistration): void {
    // Defer mutation to after the current render to avoid updating a value during computation
    scheduleOnce('afterRender', this, this._addCard, card);
  }

  private _addCard(card: CardRegistration): void {
    this.componentCardsStore = [...this.componentCardsStore, card];
  }

  private removeCard(card: CardRegistration): void {
    // Defer mutation to after the current render to avoid updating a value during computation
    scheduleOnce('afterRender', this, this._removeCard, card);
  }

  private _removeCard(card: CardRegistration): void {
    this.componentCardsStore = this.componentCardsStore.filter(
      (existing) => existing !== card,
    );
  }

  private addAtom(atom: AtomRegistration): void {
    // Defer mutation to after the current render to avoid updating a value during computation
    scheduleOnce('afterRender', this, this._addAtom, atom);
  }

  private _addAtom(atom: AtomRegistration): void {
    this.componentAtomsStore = [...this.componentAtomsStore, atom];
  }

  private removeAtom(atom: AtomRegistration): void {
    // Defer mutation to after the current render to avoid updating a value during computation
    scheduleOnce('afterRender', this, this._removeAtom, atom);
  }

  private _removeAtom(atom: AtomRegistration): void {
    this.componentAtomsStore = this.componentAtomsStore.filter(
      (existing) => existing !== atom,
    );
  }

  private generateUuid(): string {
    return `${UUID_PREFIX}${guidFor(this)}-${counter++}`;
  }

  private noop(): void {}

  private createElement(
    dom: { createElement(tagName: string): HTMLElement },
    tagName: string,
    classNames: string[] = [],
  ): HTMLElement {
    const element = dom.createElement(tagName);
    element.setAttribute('id', this.generateUuid());
    if (classNames.length > 0) {
      element.setAttribute('class', classNames.join(' '));
    }
    return element;
  }

  <template>
    <div ...attributes>
      {{this.renderedMobiledoc}}
    </div>

    {{#each this.componentCards as |card|}}
      {{#in-element card.destinationElement}}
        {{component
          card.componentDefinition
          options=(readonly card.options)
          payload=(readonly card.payload)
        }}
      {{/in-element}}
    {{/each}}

    {{#each this.componentAtoms as |atom|}}
      {{#in-element atom.destinationElement}}
        {{component
          atom.componentDefinition
          options=(readonly atom.options)
          payload=(readonly atom.payload)
          value=(readonly atom.value)
        }}
      {{/in-element}}
    {{/each}}
  </template>
}
