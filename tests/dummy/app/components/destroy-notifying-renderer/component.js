import Component from 'ember-mobiledoc-dom-renderer/components/render-mobiledoc/component';

export default class extends Component {
  willDestroy() {
    this.args.onWillDestroy();
    super.willDestroy(...arguments);
  }
}
