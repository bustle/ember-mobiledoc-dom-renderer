import RenderMobiledocComponent from 'ember-mobiledoc-dom-renderer/components/render-mobiledoc';

function renameSample(name: string): string {
  return name.replace('sample', 'sample-changed-name');
}

export default class NameChangingRenderer extends RenderMobiledocComponent {
  cardNameToComponentName(cardName: string): string {
    return renameSample(cardName);
  }

  atomNameToComponentName(atomName: string): string {
    return renameSample(atomName);
  }

  <template>
    <div ...attributes>
      {{this.renderedMobiledoc}}
    </div>

    {{#each this.componentCards as |card|}}
      {{#in-element card.destinationElement}}
        {{component
          card.componentDefinition
          options=(readonly card.options)
          payload=(readonly card.payload)
        }}
      {{/in-element}}
    {{/each}}

    {{#each this.componentAtoms as |atom|}}
      {{#in-element atom.destinationElement}}
        {{component
          atom.componentDefinition
          options=(readonly atom.options)
          payload=(readonly atom.payload)
          value=(readonly atom.value)
        }}
      {{/in-element}}
    {{/each}}
  </template>
}
