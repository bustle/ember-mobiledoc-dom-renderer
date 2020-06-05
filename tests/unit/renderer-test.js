import Renderer from 'ember-mobiledoc-dom-renderer';
import { module, test } from 'qunit';
import { createSimpleMobiledoc } from '../helpers/mobiledoc';

module('Unit | Renderer', function() {
  test('it exists', function(assert) {
    assert.ok(!!Renderer);
  });

  test('it renders simple mobiledoc', (assert) => {
    let mobiledoc = createSimpleMobiledoc('Hello, world!');

    let renderer = new Renderer();
    let rendered = renderer.render(mobiledoc);

    let fixture = document.getElementById('qunit-fixture');
    fixture.appendChild(rendered.result);
    assert.ok(fixture.innerHTML.indexOf('<p>Hello, world!</p>') !== -1,
              'renders hello world');
    assert.ok(!!rendered.teardown, 'has teardown');

    rendered.teardown();

    assert.ok(fixture.innerHTML.indexOf('<p>Hello, world!</p>') === -1,
              'tears down rendered');
  });
});
