import Component from '@ember/component';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import {
  CARD_ELEMENT_CLASS, ATOM_ELEMENT_CLASS
} from 'ember-mobiledoc-dom-renderer/components/render-mobiledoc/component';
import {
  createSimpleMobiledoc,
  createMobiledocWithStrongMarkup,
  createMobiledocWithCard,
  createMobiledocWithAtom
} from '../../helpers/mobiledoc';

module('Integration | Component | render-mobiledoc', function(hooks) {
  setupRenderingTest(hooks);

  const cardName = 'sample-test-card';
  const atomName = 'sample-test-atom';

  test('it renders mobiledoc', async function(assert) {
    this.set('mobiledoc', createSimpleMobiledoc('Hello, world!'));
    await render(hbs`<RenderMobiledoc @mobiledoc={{this.mobiledoc}} />`);
    assert.dom('p').hasText('Hello, world!', 'Renders mobiledoc');
  });

  test('it renders mobiledoc with cards', async function(assert) {
    this.set('mobiledoc', createMobiledocWithCard(cardName));
    this.set('cardNames', [cardName]);
    await render(hbs`<RenderMobiledoc @mobiledoc={{this.mobiledoc}} @cardNames={{this.cardNames}} />`);

    assert.dom('#sample-test-card').exists('renders card template');
    assert.dom('#sample-test-card').hasText('foo: bar', 'renders card payload');
    assert.dom(`.${CARD_ELEMENT_CLASS}`).exists(`renders card with class ${CARD_ELEMENT_CLASS}`);
    assert.dom(`.${CARD_ELEMENT_CLASS}-${cardName}`).exists(`renders card with class ${CARD_ELEMENT_CLASS}-${cardName}`);
  });

  test('it uses `cardNameToComponentName` to allow selecting components', async function(assert) {
    this.set('mobiledoc', createMobiledocWithCard(cardName));
    this.set('cardNames', [cardName]);

    // NameChangingRenderer replaced "sample" in card names with "sample-name-changed"
    await render(hbs`<NameChangingRenderer @mobiledoc={{this.mobiledoc}} @cardNames={{this.cardNames}} />`);
    assert.dom('#sample-test-card').doesNotExist();
    assert.dom('#sample-changed-name-test-card').exists('renders card template');
    assert.dom('#sample-changed-name-test-card').hasText('foo: bar', 'renders card payload');
  });

  test('it renders mobiledoc with atoms', async function(assert) {
    this.set('mobiledoc', createMobiledocWithAtom(atomName));
    this.set('atomNames', [atomName]);
    await render(hbs`<RenderMobiledoc @mobiledoc={{this.mobiledoc}} @atomNames={{this.atomNames}} />`);

    assert.dom('#sample-test-atom').exists('renders atom template');
    assert.dom('#sample-test-atom').includesText('value: value', 'renders atom value');
    assert.dom('#sample-test-atom').includesText('payload: bar', 'renders atom payload');
    assert.dom(`.${ATOM_ELEMENT_CLASS}`).exists(`renders atom with class ${ATOM_ELEMENT_CLASS}`);
    assert.dom(`.${ATOM_ELEMENT_CLASS}-${atomName}`).exists(`renders atom with class ${ATOM_ELEMENT_CLASS}-${atomName}`);
  });

  test('it uses `atomNameToComponentName` to allow selecting components', async function(assert) {
    this.set('mobiledoc', createMobiledocWithAtom(atomName));
    this.set('atomNames', [atomName]);

    // NameChangingRenderer replaced "sample" in atom names with "sample-name-changed"
    await render(hbs`<NameChangingRenderer @mobiledoc={{this.mobiledoc}} @atomNames={{this.atomNames}} />`);

    assert.dom('#sample-test-atom').doesNotExist();
    assert.dom('#sample-changed-name-test-atom').exists('renders atom template');
    assert.dom('#sample-changed-name-test-atom').includesText('value: value', 'renders atom value');
    assert.dom('#sample-changed-name-test-atom').includesText('payload: bar', 'renders atom payload');
  });

  test('it does not rerender if a atom component changes its card\'s payload or value', async function(assert) {
    let inserted = 0;
    let atom;
    let AtomComponent = Component.extend({
      didInsertElement() {
        atom = this;
        inserted++;
      }
    });
    this.owner.register('component:test-atom', AtomComponent);
    this.set('mobiledoc', createMobiledocWithAtom('test-atom'));
    this.set('atomNames', ['test-atom']);
    await render(hbs`<RenderMobiledoc @mobiledoc={{this.mobiledoc}} @atomNames={{this.atomNames}} />`);

    assert.equal(inserted, 1, 'inserts component once');
    run(() => atom.set('payload', {}));
    assert.equal(inserted, 1, 'after modifying payload, does not insert component atom again');
    run(() => atom.set('value', {}));
    assert.equal(inserted, 1, 'after modifying value, does not insert component atom again');
  });

  test('teardown destroys atom components', async function(assert) {
    this.set('showRendered', true);
    this.set('mobiledoc', createMobiledocWithAtom('test-atom'));
    this.set('atomNames', ['test-atom']);

    let didDestroy = [], didInsert = [];
    this.set('onWillDestroyRenderer', () => {
      didDestroy.push('destroy-notifying-renderer');
    });

    let AtomComponent = Component.extend({
      didInsertElement() { didInsert.push('test-atom'); },
      willDestroy() { didDestroy.push('test-atom'); }
    });
    this.owner.register('component:test-atom', AtomComponent);

    await render(hbs`{{#if this.showRendered}}
      <DestroyNotifyingRenderer @mobiledoc={{this.mobiledoc}} @atomNames={{this.atomNames}} @onWillDestroy={{this.onWillDestroyRenderer}} />
    {{/if}}`);

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

    assert.deepEqual(didDestroy, ['destroy-notifying-renderer', 'test-atom'], 'destroyed all');
    assert.deepEqual(didInsert, [], 'nothing inserted');
  });

  test('changing mobiledoc calls teardown and destroys atom component', async function(assert) {
    this.set('mobiledoc', createMobiledocWithAtom('test-atom'));
    this.set('atomNames', ['test-atom', 'other-atom']);

    let didDestroy = [], didInsert = [];

    this.owner.register('component:test-atom', Component.extend({
      didInsertElement() { didInsert.push('test-atom'); },
      willDestroy() { didDestroy.push('test-atom'); }
    }));
    this.owner.register('component:other-atom', Component.extend({
      didInsertElement() { didInsert.push('other-atom'); },
      willDestroy() { didDestroy.push('other-atom'); }
    }));

    await render(hbs`<RenderMobiledoc @mobiledoc={{this.mobiledoc}} @atomNames={{this.atomNames}} />`);

    assert.deepEqual(didDestroy, [], 'nothing destroyed');
    assert.deepEqual(didInsert, ['test-atom'], 'test-atom inserted');

    didInsert = [];

    this.set('mobiledoc', createMobiledocWithAtom('other-atom'));

    assert.deepEqual(didInsert, ['other-atom'], 'inserted other atom');
    assert.deepEqual(didDestroy, ['test-atom'], 'destroyed test-atom');
  });

  test('it rerenders when its mobiledoc changes', async function(assert) {
    this.set('mobiledoc', createSimpleMobiledoc('Hello, world!'));
    await render(hbs`<RenderMobiledoc @mobiledoc={{this.mobiledoc}} />`);
    assert.dom('*').hasText('Hello, world!');
    this.set('mobiledoc', createSimpleMobiledoc('Goodbye, world!'));
    assert.dom('*').hasText('Goodbye, world!');
  });

  test('it does not rerender if a card component changes its card\'s payload', async function(assert) {
    let inserted = 0;
    let card;
    let CardComponent = Component.extend({
      didInsertElement() {
        card = this;
        inserted++;
      }
    });
    this.owner.register('component:test-card', CardComponent);
    this.set('mobiledoc', createMobiledocWithCard('test-card'));
    this.set('cardNames', ['test-card']);
    await render(hbs`<RenderMobiledoc @mobiledoc={{this.mobiledoc}} @cardNames={{this.cardNames}} />`);

    assert.equal(inserted, 1, 'inserts component once');
    run(() => card.set('payload', {}));
    assert.equal(inserted, 1, 'after modifying payload, does not insert component card again');
  });

  test('teardown destroys card components', async function(assert) {
    this.set('showRendered', true);
    this.set('mobiledoc', createMobiledocWithCard('test-card'));
    this.set('cardNames', ['test-card']);

    let didDestroy = [], didInsert = [];
    this.set('onWillDestroyRenderer', () => {
      didDestroy.push('destroy-notifying-renderer');
    });

    let CardComponent = Component.extend({
      didInsertElement() { didInsert.push('test-card'); },
      willDestroy() { didDestroy.push('test-card'); }
    });
    this.owner.register('component:test-card', CardComponent);

    await render(hbs`{{#if this.showRendered}}
      <DestroyNotifyingRenderer @mobiledoc={{this.mobiledoc}} @cardNames={{this.cardNames}} @onWillDestroy={{this.onWillDestroyRenderer}} />
    {{/if}}`);

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

    assert.deepEqual(didDestroy, ['destroy-notifying-renderer', 'test-card'], 'destroyed all');
    assert.deepEqual(didInsert, [], 'nothing inserted');
  });

  test('changing mobiledoc calls teardown and destroys card components', async function(assert) {
    this.set('mobiledoc', createMobiledocWithCard('test-card'));
    this.set('cardNames', ['test-card', 'other-card']);

    let didDestroy = [], didInsert = [];
    this.set('onWillDestroyRenderer', () => {
      didDestroy.push('destroy-notifying-renderer');
    });
    this.owner.register('component:test-card', Component.extend({
      didInsertElement() { didInsert.push('test-card'); },
      willDestroy() { didDestroy.push('test-card'); }
    }));
    this.owner.register('component:other-card', Component.extend({
      didInsertElement() { didInsert.push('other-card'); },
      willDestroy() { didDestroy.push('other-card'); }
    }));

    await render(hbs`<DestroyNotifyingRenderer @mobiledoc={{this.mobiledoc}} @cardNames={{this.cardNames}} @onWillDestroy={{this.onWillDestroyRenderer}} />`);

    assert.deepEqual(didDestroy, [], 'nothing destroyed');
    assert.deepEqual(didInsert, ['test-card'], 'test-card inserted');

    didInsert = [];

    // change mobiledoc to one with other-card
    this.set('mobiledoc', createMobiledocWithCard('other-card'));

    assert.deepEqual(didInsert, ['other-card'], 'inserted other card');
    assert.deepEqual(didDestroy, ['test-card'], 'destroyed test-card');
  });

  test('Can pass unknownCardHandler', async function(assert) {
    let called = 0;
    this.set('unknownCardHandler', () => { called++; });
    this.set('mobiledoc', createMobiledocWithCard('unknown'));

    await render(hbs`<RenderMobiledoc @mobiledoc={{this.mobiledoc}} @unknownCardHandler={{this.unknownCardHandler}} />`);

    assert.equal(called, 1, 'unknownCardHandler called');
  });

  test('Can pass unknownAtomHandler', async function(assert) {
    let called = 0;
    this.set('unknownAtomHandler', () => { called++; });
    this.set('mobiledoc', createMobiledocWithAtom('unknown'));

    await render(hbs`<RenderMobiledoc @mobiledoc={{this.mobiledoc}} @unknownAtomHandler={{this.unknownAtomHandler}} />`);

    assert.equal(called, 1, 'unknownAtomHandler called');
  });

  test('Can pass sectionElementRenderer', async function(assert) {
    this.set('sectionElementRenderer', {
      p(_, doc) { return doc.createElement('h1'); }
    });
    this.set('mobiledoc', createSimpleMobiledoc('Hi'));

    await render(hbs`<RenderMobiledoc @mobiledoc={{this.mobiledoc}} @sectionElementRenderer={{this.sectionElementRenderer}} />`);

    assert.dom('h1').hasText('Hi', 'renders mobiledoc');
  });

  test('Can pass markupElementRenderer', async function(assert) {
    this.set('markupElementRenderer', {
      strong(_, doc) { return doc.createElement('span'); }
    });
    this.set('mobiledoc', createMobiledocWithStrongMarkup('Hi'));

    await render(hbs`<RenderMobiledoc @mobiledoc={{this.mobiledoc}} @markupElementRenderer={{this.markupElementRenderer}} />`);

    assert.dom('span').hasText('Hi', 'renders mobiledoc');
  });

  test('Can pass cardOptions and they appear for cards', async function(assert) {
    assert.expect(1);
    let passedOption = {};
    let cardName = 'my-card';
    this.set('mobiledoc', createMobiledocWithCard(cardName));
    this.set('cardNames', [cardName]);
    this.set('cardOptions', {passedOption});
    let CardComponent = Component.extend({
      init() {
        this._super(...arguments);
        assert.equal(this.options.passedOption, passedOption);
      }
    });
    this.owner.register('component:my-card', CardComponent);

    await render(hbs`<RenderMobiledoc @mobiledoc={{this.mobiledoc}} @cardNames={{this.cardNames}} @cardOptions={{this.cardOptions}} />`);
  });

  test('Can pass cardOptions and they appear for atoms', async function(assert) {
    assert.expect(1);
    let passedOption = {};
    let atomName = 'my-atom';
    this.set('mobiledoc', createMobiledocWithAtom(atomName));
    this.set('atomNames', [atomName]);
    this.set('cardOptions', {passedOption});
    let AtomComponent = Component.extend({
      init() {
        this._super(...arguments);
        assert.equal(this.options.passedOption, passedOption);
      }
    });
    this.owner.register('component:my-atom', AtomComponent);

    await render(hbs`<RenderMobiledoc @mobiledoc={{this.mobiledoc}} @atomNames={{this.atomNames}} @cardOptions={{this.cardOptions}} />`);
  });
});
