import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

let mobiledocs = {
  simple: {
    version: '0.3.0',
    markups: [],
    cards: [],
    atoms: [],
    sections: [
      [1, 'P', [
        [0, [], 0, 'Hello world!']
      ]]
    ]
  },
  card: {
    version: '0.3.0',
    markups: [],
    cards: [['sample-card', {}]],
    atoms: [],
    sections: [
      [10, 0]
    ]
  },
  atom: {
    version: '0.3.0',
    markups: [],
    cards: [],
    atoms: [['sample-test-atom', 'bob', {foo: 'bar'}]],
    sections: [
      [1, 'P', [
        [0, [], 0, 'Hello card'],
        [1, 0, [], 0],
        [0, [], 0, '!']
      ]]
    ]
  }
};

export default class extends Controller {
  @tracked mobiledoc = mobiledocs['simple'];
  get mobiledocNames() {
    return Object.keys(mobiledocs);
  }

  cardNames = ['sample-card'];
  atomNames = ['sample-test-atom'];

  @action
  selectMobiledoc({target: {value}}) {
    this.mobiledoc = mobiledocs[value];
  }
}
