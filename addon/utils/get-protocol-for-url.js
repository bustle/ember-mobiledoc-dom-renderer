import Ember from 'ember';

export default function getProtocolForURLfn(component) {
  let glimmerEnv = Ember.getOwner(component).lookup('service:-glimmer-environment');
  if (glimmerEnv && glimmerEnv.protocolForURL) {
    return glimmerEnv.protocolForURL;
  } else {
    return (str) => {
      let colonIdx = str.indexOf(':');
      if (colonIdx === -1) { return; }

      return str.replace(/^\s+/,'').split(':')[0] + ':';
    };
  }
}

