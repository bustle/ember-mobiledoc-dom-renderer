# ember-mobiledoc-dom-renderer

Provides:

  * Component `<RenderMobiledoc ... />` for rendering mobiledoc in your ember app
  * (For advanced use) The ability to import the [`mobiledoc-dom-renderer`](https://github.com/bustlelabs/mobiledoc-dom-renderer) class
  
To learn more about mobiledoc see [mobiledoc-kit](https://github.com/bustlelabs/mobiledoc-kit).

## Installation

* `ember install ember-mobiledoc-dom-renderer`

## Requirements

* Ember.js v3.16 or above (for older versions of Ember, try 0.7.0)
* Ember CLI v3.16 or above
* Node.js v12 or above

### Usage

#### Render basic mobiledoc in your template

```hbs
<RenderMmobiledoc @mobiledoc={{myMobileDoc}} />
```

#### Render mobiledoc with cards, using ember components to render cards

```hbs
{{! myMobiledoc is the mobiledoc you want to render }}
{{! myCardNames is an array of card names, e.g. ['embed-card', 'slideshow-card'] }}
<RenderMmobiledoc @mobiledoc={{myMobileDoc}} @cardNames={{myCardNames}} />
```

The ember components with names matching the mobiledoc card names will be rendered
and passed a `payload` property.
The ember components will be in a wrapper div with the class '__rendered-mobiledoc-card' and '__rendered-mobiledoc-card-${cardName}'.

#### Customizing card lookup

If your mobiledoc card names do not match component names, you can pass an argument to
the `<RenderMobiledoc...>` component to provide your own mapping.

E.g.:

```hbs
// components/my-component.hbs
<RenderMobiledoc
  @mobiledoc={{...}}
  @cardNameToComponentName={{this.cardNameToComponentName}}
/>
```

```javascript
// components/my-component.js
import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class extends Component {
  @action
  cardNameToComponentName(mobiledocCardName) {
    return 'cards/' + mobiledocCardName;
  }
}
```

#### Render mobiledoc with atoms, using ember components to render atoms

This works the same way as rendering mobiledoc with ember components for cards.
To pass atom names to the renderer, use the `atomNames` property, e.g.:
```hbs
{{! myAtomNames is an array of atom names, e.g. ['mention-atom'] }}
<RenderMobiledoc @mobiledoc={{myMobileDoc}} @atomNames={{myAtomNames}} />
```

The component will be passed a `payload` and `value` property.

To customize atom lookup, pass an `atomNameToComponentName` argument similar to
what is shown above for `cardNameToComponentName`.

#### Customizing markup and section rendering
The `sectionElementRenderer` and `markupElementRenderer` options can be used to
customize the elements used for sections and inline text decorations respectively.

E.g.:

```hbs
<RenderMobiledoc @mobiledoc={{this.myMobileDoc}} @sectionElementRenderer={{this.mySectionElementRenderer}} />
```

```js
mySectionElementRenderer: {
  h1: (tagName, domDocument) => {
    let element = domDocument.createElement('h1');
    element.classList.add('primary-heading');
    return element;
  }
}
```

#### Use mobiledoc-dom-renderer directly

This addon provides the mobiledoc-dom-renderer directly. Most of the time
you will want to use the `<RenderMobiledoc />` component, but if you need
to use the renderer directly in code, it can be imported:

`import DOMRenderer from 'ember-mobiledoc-dom-renderer'`;


#### Release process

See RELEASE.md
