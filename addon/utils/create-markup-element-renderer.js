/* global module */
import Ember from 'ember';

const isNode = typeof window === 'undefined' && (typeof module === 'object' && typeof module.require === 'function');
const hasDOM = typeof document === 'object';
const needsMarkupElementRenderer = !isNode && !hasDOM;

function fallbackProtocolParser(str) {
  let colonIdx = str.indexOf(':');
  if (colonIdx === -1) { return; }

  return str.replace(/^\s+/,'').split(':')[0] + ':';
}

function getProtocolForURLfn(component) {
  let glimmerEnv = Ember.getOwner(component).lookup('service:-glimmer-environment');
  if (glimmerEnv && glimmerEnv.protocolForURL) {
    return glimmerEnv.protocolForURL;
  } else {
    return fallbackProtocolParser;
  }
}

function createHrefSanitizer(component) {
  let protocolForUrl = getProtocolForURLfn(component);
  const badProtocols = [
    'vbscript:',   // jshint ignore:line
    'javascript:'  // jshint ignore:line
  ];

  return (href) => {
    let protocol = protocolForUrl(href);
    if (protocol && badProtocols.indexOf(protocol) !== -1) {
      return `unsafe:${href}`;
    } else {
      return href;
    }
  };
}

export default function createMarkupElementRenderer(component) {
  if (!needsMarkupElementRenderer) {
    return {};
  } else {
    let sanitizeHref = createHrefSanitizer(component);

    return {
      A(tagName, dom, attrs) {
        let el = dom.createElement(tagName);
        Object.keys(attrs).forEach(attrName => {
          let attrValue = attrs[attrName];

          if (attrName === 'href') {
            attrValue = sanitizeHref(attrValue);
          }

          el.setAttribute(attrName, attrValue);
        });

        return el;
      }
    };
  }
}
