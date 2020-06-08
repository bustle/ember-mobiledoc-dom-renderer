import { module, test } from 'qunit';
import { setup, visit, /* mockServer */ } from 'ember-cli-fastboot-testing/test-support';

module('FastBoot | rendering tests', function(hooks) {
  setup(hooks);

  test('renders', async function(assert) {
    let res = await visit('/fastboot');
    assert.equal(res.statusCode, 200);

    assert.dom('body', res.htmlDocument).exists({ count: 1});
    assert.dom('h1', res.htmlDocument).hasText('ember-fastboot-addon-tests');
  });

  test('renders simple mobiledoc', async function(assert) {
    let name = 'simple';
    let { htmlDocument } = await visit('/fastboot');
    let wrapper = `.render-mobiledoc-wrapper.${name}`;
    assert.dom(wrapper, htmlDocument).exists({ count: 1});

    assert.dom(`.render-mobiledoc-wrapper.${name} p`, htmlDocument).hasText('hello world');
  });

  test('renders mobiledoc with markup', async function(assert) {
    let name = 'with-markup';
    let { htmlDocument } = await visit('/fastboot');

    let wrapper = `.render-mobiledoc-wrapper.${name}`;
    assert.dom(wrapper, htmlDocument).exists({ count: 1});

    let markup = `.render-mobiledoc-wrapper.${name} em`;
    assert.dom(markup, htmlDocument).exists({ count: 1});
    assert.dom(markup, htmlDocument).hasText('markup text');
  });

  test('renders mobiledoc with link', async function(assert) {
    let name = 'with-link';
    let { htmlDocument } = await visit('/fastboot');

    let wrapper = `.render-mobiledoc-wrapper.${name}`;
    assert.dom(wrapper, htmlDocument).exists({ count: 1});

    let link = `.render-mobiledoc-wrapper.${name} a`;
    assert.dom(link, htmlDocument).exists({ count: 1});
    assert.dom(link, htmlDocument).hasAttribute('href', 'http://example.com/with-link');
    assert.dom(link, htmlDocument).hasText('linked');
  });

  test('renders mobiledoc with unsafe link', async function(assert) {
    let name = 'with-unsafe-link';
    let { htmlDocument } = await visit('/fastboot');

    let wrapper = `.render-mobiledoc-wrapper.${name}`;
    assert.dom(wrapper, htmlDocument).exists({ count: 1});

    let link = `.render-mobiledoc-wrapper.${name} a`;
    assert.dom(link, htmlDocument).exists({ count: 1});
    assert.dom(link, htmlDocument).hasAttribute('href', 'unsafe:javascript:evil');
    assert.dom(link, htmlDocument).hasText('linked unsafe');
  });

  test('renders mobiledoc with card', async function(assert) {
    let name = 'card';
    let componentClassName = 'test-card-component';
    let payloadClassName   = 'test-card-component-payload';

    let { htmlDocument, statusCode } = await visit('/fastboot');
    assert.equal(statusCode, 200);

    let wrapper = `.render-mobiledoc-wrapper.${name}`;
    assert.dom(wrapper, htmlDocument).exists({ count: 1});

    let component = `.render-mobiledoc-wrapper.${name} .${componentClassName}`;
    assert.dom(component, htmlDocument).exists({ count: 1 });

    let payload = `.render-mobiledoc-wrapper.${name} .${payloadClassName}`;
    assert.dom(payload, htmlDocument).hasText('bar');
  });

  test('renders mobiledoc with atom', async function(assert) {
    let name = 'atom';
    let componentClassName = 'test-atom-component';
    let payloadClassName   = 'test-atom-component-payload';
    let valueClassName     = 'test-atom-component-value';

    let { htmlDocument, statusCode } = await visit('/fastboot');
    assert.equal(statusCode, 200);

    let wrapper = `.render-mobiledoc-wrapper.${name}`;
    assert.dom(wrapper, htmlDocument).exists({ count: 1});

    let component = `.render-mobiledoc-wrapper.${name} .${componentClassName}`;
    assert.dom(component, htmlDocument).exists({ count: 1 });

    let payloadSelector = `.render-mobiledoc-wrapper.${name} .${payloadClassName}`;
    assert.dom(payloadSelector, htmlDocument).hasText('bar');

    let valueSelector = `.render-mobiledoc-wrapper.${name} .${valueClassName}`;
    assert.dom(valueSelector, htmlDocument).hasText('value');
  });

});
