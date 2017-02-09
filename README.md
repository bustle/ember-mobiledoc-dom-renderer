# ember-mobiledoc-dom-renderer
[![Build Status](https://travis-ci.org/bustlelabs/ember-mobiledoc-dom-renderer.svg?branch=master)](https://travis-ci.org/bustlelabs/ember-mobiledoc-dom-renderer)

Provides:

  * Component `{{render-mobiledoc}}` for rendering mobiledoc in your ember app
  * (For advanced use) The ability to import the [`mobiledoc-dom-renderer`](https://github.com/bustlelabs/mobiledoc-dom-renderer) class
  
To learn more about mobiledoc see [mobiledoc-kit](https://github.com/bustlelabs/mobiledoc-kit).

## Installation

* `ember install ember-mobiledoc-dom-renderer`

### Usage

#### Render basic mobiledoc in your template

```hbs
{{render-mobiledoc mobiledoc=myMobileDoc}}
```

#### Render mobiledoc with cards, using ember components to render cards

```hbs
{{! myMobiledoc is the mobiledoc you want to render }}
{{! myCardNames is an array of card names, e.g. ['embed-card', 'slideshow-card'] }}
{{render-mobiledoc mobiledoc=myMobileDoc cardNames=myCardNames}}
```

The ember components with names matching the mobiledoc card names will be rendered
and passed a `payload` property.
The ember components will be in a wrapper div with the class '__rendered-mobiledoc-card' and '__rendered-mobiledoc-card-${cardName}'.

#### Customizing card lookup

If your mobiledoc card names do not match component names, you can subclass
the `render-mobiledoc` component and override its `cardNameToComponentName` method.

E.g.:

```javascript
// components/my-render-mobiledoc.js
import RenderMobiledoc from 'ember-mobiledoc-dom-renderer/components/render-mobiledoc';
export default RenderMobiledoc.extend({
  cardNameToComponentName(mobiledocCardName) {
    return 'cards/' + mobiledocCardName;
  }
});
```

#### Render mobiledoc with atoms, using ember components to render atoms

This works the same way as rendering mobiledoc with ember components for cards.
To pass atom names to the renderer, use the `atomNames` property, e.g.:
```hbs
{{! myAtomNames is an array of atom names, e.g. ['mention-atom'] }}
{{render-mobiledoc mobiledoc=myMobileDoc atomNames=myAtomNames}}
```

To customize atom lookup, extend the `render-mobiledoc` component and override
its `atomNameToComponentName` method.

#### Use mobiledoc-dom-renderer directly

This addon provides the mobiledoc-dom-renderer directly. Most of the time
you will want to use the `{{render-mobiledoc}}` component, but if you need
to use the renderer directly in code, it can be imported:

`import DOMRenderer from 'ember-mobiledoc-dom-renderer'`;


#### Release process

To release a new version:

  * Use `np` (`npm install -g np`)
  * `np <version>` (e.g. `np 1.0.0`)
  * `git push <origin> --tags`
