import Component from 'ember-mobiledoc-dom-renderer/components/render-mobiledoc/component';

export default class extends Component {
  cardNameToComponentName(cardName) {
    return cardName.replace('sample', 'sample-changed-name');
  }
  atomNameToComponentName(cardName) {
    return cardName.replace('sample', 'sample-changed-name');
  }
}
