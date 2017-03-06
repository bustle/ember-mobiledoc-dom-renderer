import getProtocolForURLfn from './get-protocol-for-url';

export default function createMarkupSanitizer(component) {
  let protocolForURL = getProtocolForURLfn(component);
  let badProtocols = [
    'vbscript:',  // jshint ignore:line
    'javascript:' // jshint ignore:line
  ];

  let sanitizeHref = (href) => {
    let protocol = protocolForURL(href);
    if (protocol && badProtocols.indexOf(protocol) !== -1) {
      return `unsafe:${href}`;
    } else {
      return href;
    }
  };

  return ({tagName, attributeName, attributeValue}) => {
    if (tagName === 'a' && attributeName === 'href') {
      return sanitizeHref(attributeValue);
    }
  };
}
