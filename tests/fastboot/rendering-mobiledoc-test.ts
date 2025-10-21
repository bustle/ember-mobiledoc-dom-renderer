import { module, test } from 'qunit';
import { setup, visit } from 'ember-cli-fastboot-testing/test-support';

module('FastBoot | rendering tests', function (hooks) {
  setup(hooks);

  test('renders', async function (assert) {
    const res = await visit('/fastboot');
    assert.strictEqual(res.statusCode, 200);

    assert.dom('body', res.htmlDocument).exists({ count: 1 });
    assert.dom('h1', res.htmlDocument).hasText('ember-fastboot-addon-tests');
  });

  test('renders simple mobiledoc', async function (assert) {
    const name = 'simple';
    const { htmlDocument } = await visit('/fastboot');
    const wrapper = `.render-mobiledoc-wrapper.${name}`;
    assert.dom(wrapper, htmlDocument).exists({ count: 1 });

    assert
      .dom(`.render-mobiledoc-wrapper.${name} p`, htmlDocument)
      .hasText('hello world');
  });

  test('renders mobiledoc with markup', async function (assert) {
    const name = 'with-markup';
    const { htmlDocument } = await visit('/fastboot');

    const wrapper = `.render-mobiledoc-wrapper.${name}`;
    assert.dom(wrapper, htmlDocument).exists({ count: 1 });

    const markup = `.render-mobiledoc-wrapper.${name} em`;
    assert.dom(markup, htmlDocument).exists({ count: 1 });
    assert.dom(markup, htmlDocument).hasText('markup text');
  });

  test('renders mobiledoc with link', async function (assert) {
    const name = 'with-link';
    const { htmlDocument } = await visit('/fastboot');

    const wrapper = `.render-mobiledoc-wrapper.${name}`;
    assert.dom(wrapper, htmlDocument).exists({ count: 1 });

    const link = `.render-mobiledoc-wrapper.${name} a`;
    assert.dom(link, htmlDocument).exists({ count: 1 });
    assert
      .dom(link, htmlDocument)
      .hasAttribute('href', 'http://example.com/with-link');
    assert.dom(link, htmlDocument).hasText('linked');
  });

  test('renders mobiledoc with unsafe link', async function (assert) {
    const name = 'with-unsafe-link';
    const { htmlDocument } = await visit('/fastboot');

    const wrapper = `.render-mobiledoc-wrapper.${name}`;
    assert.dom(wrapper, htmlDocument).exists({ count: 1 });

    const link = `.render-mobiledoc-wrapper.${name} a`;
    assert.dom(link, htmlDocument).exists({ count: 1 });
    assert
      .dom(link, htmlDocument)
      .hasAttribute('href', 'unsafe:javascript:evil');
    assert.dom(link, htmlDocument).hasText('linked unsafe');
  });

  test('renders mobiledoc with card', async function (assert) {
    const name = 'card';
    const componentClassName = 'test-card-component';
    const payloadClassName = 'test-card-component-payload';

    const { htmlDocument, statusCode } = await visit('/fastboot');
    assert.strictEqual(statusCode, 200);

    const wrapper = `.render-mobiledoc-wrapper.${name}`;
    assert.dom(wrapper, htmlDocument).exists({ count: 1 });

    const component = `.render-mobiledoc-wrapper.${name} .${componentClassName}`;
    assert.dom(component, htmlDocument).exists({ count: 1 });

    const payload = `.render-mobiledoc-wrapper.${name} .${payloadClassName}`;
    assert.dom(payload, htmlDocument).hasText('bar');
  });

  test('renders mobiledoc with atom', async function (assert) {
    const name = 'atom';
    const componentClassName = 'test-atom-component';
    const payloadClassName = 'test-atom-component-payload';
    const valueClassName = 'test-atom-component-value';

    const { htmlDocument, statusCode } = await visit('/fastboot');
    assert.strictEqual(statusCode, 200);

    const wrapper = `.render-mobiledoc-wrapper.${name}`;
    assert.dom(wrapper, htmlDocument).exists({ count: 1 });

    const component = `.render-mobiledoc-wrapper.${name} .${componentClassName}`;
    assert.dom(component, htmlDocument).exists({ count: 1 });

    const payloadSelector = `.render-mobiledoc-wrapper.${name} .${payloadClassName}`;
    assert.dom(payloadSelector, htmlDocument).hasText('bar');

    const valueSelector = `.render-mobiledoc-wrapper.${name} .${valueClassName}`;
    assert.dom(valueSelector, htmlDocument).hasText('value');
  });
});
