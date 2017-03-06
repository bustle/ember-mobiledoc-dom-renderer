'use strict';

const expect = require('chai').expect;
const setupTest = require('ember-fastboot-addon-tests').setupTest;

describe('index', function() {
  setupTest('fastboot'/*, options */);

  it('renders', function() {
    return this.visit('/')
      .then(function(res) {
        let $ = res.jQuery;
        let response = res.response;

        expect(response.statusCode).to.equal(200);
        expect($('body').length).to.equal(1);
        expect($('h1').text().trim()).to.equal('ember-fastboot-addon-tests');
      });
  });

  it('renders simple mobiledoc', function() {
    let name = 'simple';

    return this.visit('/')
      .then(function(res) {
        let $ = res.jQuery;
        let response = res.response;

        let wrapper = $(`.render-mobiledoc-wrapper.${name}`);
        expect(wrapper.length).to.equal(1);

        let rendered = $(`.render-mobiledoc-wrapper.${name} p`).text().trim();
        expect(rendered).to.equal('hello world');
      });
  });

  it('renders mobiledoc with markup', function() {
    let name = 'with-markup';
    return this.visit('/')
      .then(function(res) {
        let $ = res.jQuery;
        let response = res.response;

        let wrapper = $(`.render-mobiledoc-wrapper.${name}`);
        expect(wrapper.length).to.equal(1);

        let markup = $(`.render-mobiledoc-wrapper.${name} em`);
        expect(markup.length).to.equal(1);
        expect(markup.text().trim()).to.equal('markup text');
      });
  });

  it('renders mobiledoc with link', function() {
    let name = 'with-link';
    return this.visit('/')
      .then(function(res) {
        let $ = res.jQuery;
        let response = res.response;

        let wrapper = $(`.render-mobiledoc-wrapper.${name}`);
        expect(wrapper.length).to.equal(1);

        let link = $(`.render-mobiledoc-wrapper.${name} a`);
        expect(link.length).to.equal(1);
        expect(link.attr('href')).to.equal('http://example.com/with-link');
        expect(link.text().trim()).to.equal('linked');
      });
  });

  it('renders mobiledoc with unsafe link', function() {
    let name = 'with-unsafe-link';
    return this.visit('/')
      .then(function(res) {
        let $ = res.jQuery;
        let response = res.response;

        let wrapper = $(`.render-mobiledoc-wrapper.${name}`);
        expect(wrapper.length).to.equal(1);

        let link = $(`.render-mobiledoc-wrapper.${name} a`);
        expect(link.length).to.equal(1);
        expect(link.attr('href')).to.equal('unsafe:javascript:evil');
        expect(link.text().trim()).to.equal('linked unsafe');
      });
  });

});
