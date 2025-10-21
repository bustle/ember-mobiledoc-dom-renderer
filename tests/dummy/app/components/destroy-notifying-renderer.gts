import RenderMobiledocComponent from 'ember-mobiledoc-dom-renderer/components/render-mobiledoc';

export default class DestroyNotifyingRenderer extends RenderMobiledocComponent {
  willDestroy(): void {
    this.args.onWillDestroy?.();
    super.willDestroy();
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
