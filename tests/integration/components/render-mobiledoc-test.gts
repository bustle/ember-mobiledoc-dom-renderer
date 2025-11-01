import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { run } from '@ember/runloop';
import { render, click, type TestContext } from '@ember/test-helpers';
import { on } from '@ember/modifier';
import RenderMobiledoc from 'ember-mobiledoc-dom-renderer/components/render-mobiledoc';
import DestroyNotifyingRenderer from 'dummy/components/destroy-notifying-renderer';
import NameChangingRenderer from 'dummy/components/name-changing-renderer';
import {
  CARD_ELEMENT_CLASS,
  ATOM_ELEMENT_CLASS,
} from 'ember-mobiledoc-dom-renderer/components/render-mobiledoc';
import {
  createSimpleMobiledoc,
  createMobiledocWithStrongMarkup,
  createMobiledocWithCard,
  createMobiledocWithAtom,
  createMobiledocWithLink,
} from '../../helpers/mobiledoc';

type MobiledocTestContext = TestContext & {
  mobiledoc: unknown;
  cardNames: string[];
  atomNames: string[];
  cardNameToComponentName: (cardName: string) => string;
  atomNameToComponentName: (atomName: string) => string;
  sectionElementRenderer: object;
  markupElementRenderer: object;
  cardOptions: object;
  unknownCardHandler: () => void;
  unknownAtomHandler: () => void;
  showRendered: boolean;
  onWillDestroyRenderer: () => void;
  handleClick: (ev: Event) => void;
};

module('Integration | Component | render-mobiledoc', function (hooks) {
  setupRenderingTest(hooks);

  const cardName = 'sample-test-card';
  const atomName = 'sample-test-atom';

  test('it renders mobiledoc', async function (this: MobiledocTestContext, assert) {
    this.set('mobiledoc', createSimpleMobiledoc('Hello, world!'));
    const context = this;
    await render(
      <template><RenderMobiledoc @mobiledoc={{context.mobiledoc}} /></template>,
    );
    assert.dom('p').hasText('Hello, world!', 'Renders mobiledoc');
  });

  test('it renders mobiledoc with cards', async function (this: MobiledocTestContext, assert) {
    this.set('mobiledoc', createMobiledocWithCard(cardName));
    this.set('cardNames', [cardName]);
    const context = this;
    await render(
      <template>
        <RenderMobiledoc
          @mobiledoc={{context.mobiledoc}}
          @cardNames={{context.cardNames}}
        />
      </template>,
    );

    assert.dom('#sample-test-card').exists('renders card template');
    assert.dom('#sample-test-card').hasText('foo: bar', 'renders card payload');
    assert
      .dom(`.${CARD_ELEMENT_CLASS}`)
      .exists(`renders card with class ${CARD_ELEMENT_CLASS}`);
    assert
      .dom(`.${CARD_ELEMENT_CLASS}-${cardName}`)
      .exists(`renders card with class ${CARD_ELEMENT_CLASS}-${cardName}`);
  });

  test('it uses `cardNameToComponentName` to allow selecting components (inheritance)', async function (this: MobiledocTestContext, assert) {
    this.set('mobiledoc', createMobiledocWithCard(cardName));
    this.set('cardNames', [cardName]);

    // NameChangingRenderer replaced "sample" in card names with "sample-name-changed"
    const context = this;
    await render(
      <template>
        <NameChangingRenderer
          @mobiledoc={{context.mobiledoc}}
          @cardNames={{context.cardNames}}
        />
      </template>,
    );
    assert.dom('#sample-test-card').doesNotExist();
    assert
      .dom('#sample-changed-name-test-card')
      .exists('renders card template');
    assert
      .dom('#sample-changed-name-test-card')
      .hasText('foo: bar', 'renders card payload');
  });

  test('it uses `cardNameToComponentName` to allow selecting components (arg)', async function (this: MobiledocTestContext, assert) {
    this.set('mobiledoc', createMobiledocWithCard(cardName));
    this.set('cardNames', [cardName]);
    this.set('cardNameToComponentName', (cardName) => {
      return cardName.replace('sample', 'sample-changed-name');
    });
    const context = this;
    await render(
      <template>
        <RenderMobiledoc
          @mobiledoc={{context.mobiledoc}}
          @cardNames={{context.cardNames}}
          @cardNameToComponentName={{context.cardNameToComponentName}}
        />
      </template>,
    );
    assert.dom('#sample-test-card').doesNotExist();
    assert
      .dom('#sample-changed-name-test-card')
      .exists('renders card template');
    assert
      .dom('#sample-changed-name-test-card')
      .hasText('foo: bar', 'renders card payload');
  });

  test('it renders mobiledoc with atoms', async function (this: MobiledocTestContext, assert) {
    this.set('mobiledoc', createMobiledocWithAtom(atomName));
    this.set('atomNames', [atomName]);
    const context = this;
    await render(
      <template>
        <RenderMobiledoc
          @mobiledoc={{context.mobiledoc}}
          @atomNames={{context.atomNames}}
        />
      </template>,
    );

    assert.dom('#sample-test-atom').exists('renders atom template');
    assert
      .dom('#sample-test-atom')
      .includesText('value: value', 'renders atom value');
    assert
      .dom('#sample-test-atom')
      .includesText('payload: bar', 'renders atom payload');
    assert
      .dom(`.${ATOM_ELEMENT_CLASS}`)
      .exists(`renders atom with class ${ATOM_ELEMENT_CLASS}`);
    assert
      .dom(`.${ATOM_ELEMENT_CLASS}-${atomName}`)
      .exists(`renders atom with class ${ATOM_ELEMENT_CLASS}-${atomName}`);
  });

  test('it uses `atomNameToComponentName` to allow selecting components (inheritance)', async function (this: MobiledocTestContext, assert) {
    this.set('mobiledoc', createMobiledocWithAtom(atomName));
    this.set('atomNames', [atomName]);

    // NameChangingRenderer replaced "sample" in atom names with "sample-name-changed"
    const context = this;
    await render(
      <template>
        <NameChangingRenderer
          @mobiledoc={{context.mobiledoc}}
          @atomNames={{context.atomNames}}
        />
      </template>,
    );

    assert.dom('#sample-test-atom').doesNotExist();
    assert
      .dom('#sample-changed-name-test-atom')
      .exists('renders atom template');
    assert
      .dom('#sample-changed-name-test-atom')
      .includesText('value: value', 'renders atom value');
    assert
      .dom('#sample-changed-name-test-atom')
      .includesText('payload: bar', 'renders atom payload');
  });

  test('it uses `atomNameToComponentName` to allow selecting components (arg)', async function (this: MobiledocTestContext, assert) {
    this.set('mobiledoc', createMobiledocWithAtom(atomName));
    this.set('atomNames', [atomName]);
    this.set('atomNameToComponentName', (atomName) => {
      return atomName.replace('sample', 'sample-changed-name');
    });
    const context = this;
    await render(
      <template>
        <RenderMobiledoc
          @mobiledoc={{context.mobiledoc}}
          @atomNames={{context.atomNames}}
          @atomNameToComponentName={{context.atomNameToComponentName}}
        />
      </template>,
    );
    assert.dom('#sample-test-atom').doesNotExist();
    assert
      .dom('#sample-changed-name-test-atom')
      .exists('renders atom template');
    assert
      .dom('#sample-changed-name-test-atom')
      .includesText('value: value', 'renders atom value');
    assert
      .dom('#sample-changed-name-test-atom')
      .includesText('payload: bar', 'renders atom payload');
  });

  test("it does not rerender if a atom component changes its card's payload or value", async function (assert) {
    let inserted = 0;
    let atom;
    class AtomComponent extends Component {
      @tracked payload;
      @tracked value;
      constructor(owner, args) {
        super(owner, args);
        atom = this;
        inserted++;
      }
    }
    this.owner.register('component:test-atom', AtomComponent);
    this.set('mobiledoc', createMobiledocWithAtom('test-atom'));
    this.set('atomNames', ['test-atom']);
    const context = this;
    await render(
      <template>
        <RenderMobiledoc
          @mobiledoc={{context.mobiledoc}}
          @atomNames={{context.atomNames}}
        />
      </template>,
    );

    assert.strictEqual(inserted, 1, 'inserts component once');
    run(() => (atom.payload = {}));
    assert.strictEqual(
      inserted,
      1,
      'after modifying payload, does not insert component atom again',
    );
    run(() => (atom.value = {}));
    assert.strictEqual(
      inserted,
      1,
      'after modifying value, does not insert component atom again',
    );
  });

  test('teardown destroys atom components', async function (this: MobiledocTestContext, assert) {
    this.set('showRendered', true);
    this.set('mobiledoc', createMobiledocWithAtom('test-atom'));
    this.set('atomNames', ['test-atom']);

    let didDestroy: string[] = [],
      didInsert: string[] = [];
    this.set('onWillDestroyRenderer', () => {
      didDestroy.push('destroy-notifying-renderer');
    });

    class AtomComponent extends Component {
      constructor(owner, args) {
        super(owner, args);
        didInsert.push('test-atom');
      }
      willDestroy() {
        super.willDestroy();
        didDestroy.push('test-atom');
      }
    }
    this.owner.register('component:test-atom', AtomComponent);

    const context = this;
    await render(
      <template>
        {{#if context.showRendered}}
          <DestroyNotifyingRenderer
            @mobiledoc={{context.mobiledoc}}
            @atomNames={{context.atomNames}}
            @onWillDestroy={{context.onWillDestroyRenderer}}
          />
        {{/if}}
      </template>,
    );

    assert.deepEqual(didDestroy, [], 'nothing destroyed');
    assert.deepEqual(didInsert, ['test-atom'], 'test-atom inserted');

    didInsert = [];

    this.set('mobiledoc', createSimpleMobiledoc('no cards or atoms'));

    assert.deepEqual(didDestroy, ['test-atom'], 'test-atom destroyed');
    assert.deepEqual(didInsert, [], 'nothing inserted');

    didDestroy = [];

    this.set('mobiledoc', createMobiledocWithAtom('test-atom'));

    didInsert = [];
    didDestroy = [];

    this.set('showRendered', false);

    assert.deepEqual(
      didDestroy,
      ['destroy-notifying-renderer', 'test-atom'],
      'destroyed all',
    );
    assert.deepEqual(didInsert, [], 'nothing inserted');
  });

  test('changing mobiledoc calls teardown and destroys atom component', async function (this: MobiledocTestContext, assert) {
    this.set('mobiledoc', createMobiledocWithAtom('test-atom'));
    this.set('atomNames', ['test-atom', 'other-atom']);

    let didDestroy: string[] = [],
      didInsert: string[] = [];

    class TestAtomComponent extends Component {
      constructor(owner, args) {
        super(owner, args);
        didInsert.push('test-atom');
      }
      willDestroy() {
        super.willDestroy();
        didDestroy.push('test-atom');
      }
    }
    class OtherAtomComponent extends Component {
      constructor(owner, args) {
        super(owner, args);
        didInsert.push('other-atom');
      }
      willDestroy() {
        super.willDestroy();
        didDestroy.push('other-atom');
      }
    }
    this.owner.register('component:test-atom', TestAtomComponent);
    this.owner.register('component:other-atom', OtherAtomComponent);

    const context = this;
    await render(
      <template>
        <RenderMobiledoc
          @mobiledoc={{context.mobiledoc}}
          @atomNames={{context.atomNames}}
        />
      </template>,
    );

    assert.deepEqual(didDestroy, [], 'nothing destroyed');
    assert.deepEqual(didInsert, ['test-atom'], 'test-atom inserted');

    didInsert = [];

    this.set('mobiledoc', createMobiledocWithAtom('other-atom'));

    assert.deepEqual(didInsert, ['other-atom'], 'inserted other atom');
    assert.deepEqual(didDestroy, ['test-atom'], 'destroyed test-atom');
  });

  test('it rerenders when its mobiledoc changes', async function (this: MobiledocTestContext, assert) {
    this.set('mobiledoc', createSimpleMobiledoc('Hello, world!'));
    const context = this;
    await render(
      <template><RenderMobiledoc @mobiledoc={{context.mobiledoc}} /></template>,
    );
    assert.dom('*').hasText('Hello, world!');
    this.set('mobiledoc', createSimpleMobiledoc('Goodbye, world!'));
    assert.dom('*').hasText('Goodbye, world!');
  });

  test("it does not rerender if a card component changes its card's payload", async function (assert) {
    let inserted = 0;
    let card;
    class CardComponent extends Component {
      @tracked payload;
      constructor(owner, args) {
        super(owner, args);
        card = this;
        inserted++;
      }
    }
    this.owner.register('component:test-card', CardComponent);
    this.set('mobiledoc', createMobiledocWithCard('test-card'));
    this.set('cardNames', ['test-card']);
    const context = this;
    await render(
      <template>
        <RenderMobiledoc
          @mobiledoc={{context.mobiledoc}}
          @cardNames={{context.cardNames}}
        />
      </template>,
    );

    assert.strictEqual(inserted, 1, 'inserts component once');
    run(() => (card.payload = {}));
    assert.strictEqual(
      inserted,
      1,
      'after modifying payload, does not insert component card again',
    );
  });

  test('teardown destroys card components', async function (this: MobiledocTestContext, assert) {
    this.set('showRendered', true);
    this.set('mobiledoc', createMobiledocWithCard('test-card'));
    this.set('cardNames', ['test-card']);

    let didDestroy: string[] = [],
      didInsert: string[] = [];
    this.set('onWillDestroyRenderer', () => {
      didDestroy.push('destroy-notifying-renderer');
    });

    class CardComponent extends Component {
      constructor(owner, args) {
        super(owner, args);
        didInsert.push('test-card');
      }
      willDestroy() {
        super.willDestroy();
        didDestroy.push('test-card');
      }
    }
    this.owner.register('component:test-card', CardComponent);

    const context = this;
    await render(
      <template>
        {{#if context.showRendered}}
          <DestroyNotifyingRenderer
            @mobiledoc={{context.mobiledoc}}
            @cardNames={{context.cardNames}}
            @onWillDestroy={{context.onWillDestroyRenderer}}
          />
        {{/if}}
      </template>,
    );

    assert.deepEqual(didDestroy, [], 'nothing destroyed');
    assert.deepEqual(didInsert, ['test-card'], 'test-card inserted');

    didInsert = [];

    this.set('mobiledoc', createSimpleMobiledoc('no cards'));

    assert.deepEqual(didDestroy, ['test-card'], 'test-card destroyed');
    assert.deepEqual(didInsert, [], 'nothing inserted');

    // Change back to mobiledoc with card
    this.set('mobiledoc', createMobiledocWithCard('test-card'));

    didInsert = [];
    didDestroy = [];

    this.set('showRendered', false);

    assert.deepEqual(
      didDestroy,
      ['destroy-notifying-renderer', 'test-card'],
      'destroyed all',
    );
    assert.deepEqual(didInsert, [], 'nothing inserted');
  });

  test('changing mobiledoc calls teardown and destroys card components', async function (this: MobiledocTestContext, assert) {
    this.set('mobiledoc', createMobiledocWithCard('test-card'));
    this.set('cardNames', ['test-card', 'other-card']);

    let didDestroy: string[] = [],
      didInsert: string[] = [];
    this.set('onWillDestroyRenderer', () => {
      didDestroy.push('destroy-notifying-renderer');
    });
    class CardComponent extends Component {
      constructor(owner, args) {
        super(owner, args);
        didInsert.push('test-card');
      }
      willDestroy() {
        super.willDestroy();
        didDestroy.push('test-card');
      }
    }
    class OtherComponent extends Component {
      constructor(owner, args) {
        super(owner, args);
        didInsert.push('other-card');
      }
      willDestroy() {
        super.willDestroy();
        didDestroy.push('other-card');
      }
    }
    this.owner.register('component:test-card', CardComponent);
    this.owner.register('component:other-card', OtherComponent);

    const context = this;
    await render(
      <template>
        <DestroyNotifyingRenderer
          @mobiledoc={{context.mobiledoc}}
          @cardNames={{context.cardNames}}
          @onWillDestroy={{context.onWillDestroyRenderer}}
        />
      </template>,
    );

    assert.deepEqual(didDestroy, [], 'nothing destroyed');
    assert.deepEqual(didInsert, ['test-card'], 'test-card inserted');

    didInsert = [];

    // change mobiledoc to one with other-card
    this.set('mobiledoc', createMobiledocWithCard('other-card'));

    assert.deepEqual(didInsert, ['other-card'], 'inserted other card');
    assert.deepEqual(didDestroy, ['test-card'], 'destroyed test-card');
  });

  test('Can pass unknownCardHandler', async function (this: MobiledocTestContext, assert) {
    let called = 0;
    this.set('unknownCardHandler', () => {
      called++;
    });
    this.set('mobiledoc', createMobiledocWithCard('unknown'));

    const context = this;
    await render(
      <template>
        <RenderMobiledoc
          @mobiledoc={{context.mobiledoc}}
          @unknownCardHandler={{context.unknownCardHandler}}
        />
      </template>,
    );

    assert.strictEqual(called, 1, 'unknownCardHandler called');
  });

  test('Can pass unknownAtomHandler', async function (this: MobiledocTestContext, assert) {
    let called = 0;
    this.set('unknownAtomHandler', () => {
      called++;
    });
    this.set('mobiledoc', createMobiledocWithAtom('unknown'));

    const context = this;
    await render(
      <template>
        <RenderMobiledoc
          @mobiledoc={{context.mobiledoc}}
          @unknownAtomHandler={{context.unknownAtomHandler}}
        />
      </template>,
    );

    assert.strictEqual(called, 1, 'unknownAtomHandler called');
  });

  test('Can pass sectionElementRenderer', async function (this: MobiledocTestContext, assert) {
    this.set('sectionElementRenderer', {
      p(_, doc) {
        return doc.createElement('h1');
      },
    });
    this.set('mobiledoc', createSimpleMobiledoc('Hi'));

    const context = this;
    await render(
      <template>
        <RenderMobiledoc
          @mobiledoc={{context.mobiledoc}}
          @sectionElementRenderer={{context.sectionElementRenderer}}
        />
      </template>,
    );

    assert.dom('h1').hasText('Hi', 'renders mobiledoc');
  });

  test('Can pass markupElementRenderer', async function (this: MobiledocTestContext, assert) {
    this.set('markupElementRenderer', {
      strong(_, doc) {
        return doc.createElement('span');
      },
    });
    this.set('mobiledoc', createMobiledocWithStrongMarkup('Hi'));

    const context = this;
    await render(
      <template>
        <RenderMobiledoc
          @mobiledoc={{context.mobiledoc}}
          @markupElementRenderer={{context.markupElementRenderer}}
        />
      </template>,
    );

    assert.dom('span').hasText('Hi', 'renders mobiledoc');
  });

  test('Can pass cardOptions and they appear for cards', async function (this: MobiledocTestContext, assert) {
    let passedOption = {};
    let cardName = 'my-card';
    this.set('mobiledoc', createMobiledocWithCard(cardName));
    this.set('cardNames', [cardName]);
    this.set('cardOptions', { passedOption });
    class CardComponent extends Component {
      constructor(owner, args) {
        super(owner, args);
        assert.strictEqual(this.args.options.passedOption, passedOption);
      }
    }
    this.owner.register('component:my-card', CardComponent);

    const context = this;
    await render(
      <template>
        <RenderMobiledoc
          @mobiledoc={{context.mobiledoc}}
          @cardNames={{context.cardNames}}
          @cardOptions={{context.cardOptions}}
        />
      </template>,
    );
  });

  test('Can pass cardOptions and they appear for atoms', async function (this: MobiledocTestContext, assert) {
    let passedOption = {};
    let atomName = 'my-atom';
    this.set('mobiledoc', createMobiledocWithAtom(atomName));
    this.set('atomNames', [atomName]);
    this.set('cardOptions', { passedOption });
    class AtomComponent extends Component {
      constructor(owner, args) {
        super(owner, args);
        assert.strictEqual(this.args.options.passedOption, passedOption);
      }
    }
    this.owner.register('component:my-atom', AtomComponent);

    const context = this;
    await render(
      <template>
        <RenderMobiledoc
          @mobiledoc={{context.mobiledoc}}
          @atomNames={{context.atomNames}}
          @cardOptions={{context.cardOptions}}
        />
      </template>,
    );
  });

  test('it renders links and forwards splattributes click', async function (this: MobiledocTestContext, assert) {
    let clicked = false;
    this.set('handleClick', (ev) => {
      ev.preventDefault();
      clicked = true;
    });
    this.set(
      'mobiledoc',
      createMobiledocWithLink('https://example.com', 'Example'),
    );
    const context = this;
    await render(
      <template>
        <RenderMobiledoc
          @mobiledoc={{context.mobiledoc}}
          {{on 'click' context.handleClick}}
        />
      </template>,
    );

    assert.dom('a').exists('renders an anchor element');
    assert.dom('a').hasAttribute('href', 'https://example.com');

    await click('a');
    assert.ok(clicked, 'click handler invoked via splattributes');
  });
});
