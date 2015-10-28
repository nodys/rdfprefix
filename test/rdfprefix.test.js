/* global describe it */

var rdfprefix = require('..')
var expect = require('expect.js')

describe('rdfprefix', function () {
  it('should returns a function', function () {
    var prefixes = rdfprefix()
    expect(prefixes).to.be.a('function')
  })

  it('should be initialisable with a prefixes hash', function () {
    var prefixes = rdfprefix({
      schema: 'http://schema.org/',
      owl: 'http://www.w3.org/2002/07/owl#'
    })
    expect(prefixes.toJSON()).to.be.eql({
      schema: 'http://schema.org/',
      owl: 'http://www.w3.org/2002/07/owl#'
    })
  })

  it('should be initialisable with an array of prefixes hash', function () {
    var prefixes = rdfprefix([
      { schema: 'http://schema.org/' },
      { owl: 'http://www.w3.org/2002/07/owl#' }
    ])
    expect(prefixes.toJSON()).to.be.eql({
      schema: 'http://schema.org/',
      owl: 'http://www.w3.org/2002/07/owl#'
    })
  })

  it('should accept more prefixes', function () {
    var prefixes = rdfprefix({ schema: 'http://schema.org/' })

    // Many
    prefixes([{ owl: 'http://www.w3.org/2002/07/owl#' }])
    prefixes({ cc: 'http://creativecommons.org/ns#' })

    // One
    prefixes('rdfs', 'http://www.w3.org/2000/01/rdf-schema#')

    expect(prefixes.toJSON()).to.be.eql({
      schema: 'http://schema.org/',
      owl: 'http://www.w3.org/2002/07/owl#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      cc: 'http://creativecommons.org/ns#'
    })
  })

  it('should expand prefixed iri', function () {
    var prefixes = rdfprefix({
      schema: 'http://schema.org/',
      name: 'schema:name'
    })

    expect(prefixes.toJSON()).to.be.eql({
      schema: 'http://schema.org/',
      name: 'http://schema.org/name'
    })
  })

  it('should throw when trying to expand prefixed iri with undefined prefix (strict)', function () {
    expect(function () {
      rdfprefix({
        name: 'schema:name'
      })
    }).to.throwError()
  })

  it('should throw when trying to expand prefixed iri with undefined prefix (loop)', function () {
    expect(function () {
      rdfprefix({
        schema: 'undefined:schema',
        name: 'schema:name'
      })
    }).to.throwError()
  })

  it('should support json-ld-like context prefix (with @id)', function () {
    var prefixes = rdfprefix({
      schema: 'http://schema.org/',
      name: { '@id': 'schema:name' }
    })

    expect(prefixes.toJSON()).to.be.eql({
      schema: 'http://schema.org/',
      name: 'http://schema.org/name'
    })
  })

  it('should support json-ld-like context @vocab to define a default vocabulary', function () {
    var prefixes = rdfprefix({
      '@vocab': 'http://schema.org/'
    })
    expect(prefixes.expand('name')).to.be.eql('http://schema.org/name')
  })

  it('should not expose @vocab with #toJSON()', function () {
    var prefixes = rdfprefix({
      '@vocab': 'http://schema.org/'
    })
    expect(prefixes.toJSON()).to.be.eql({})
  })

  it('should not expose @vocab with #toContext()', function () {
    var prefixes = rdfprefix({
      '@vocab': 'http://schema.org/'
    })
    expect(prefixes.toContext()).to.be.eql({'@vocab': 'http://schema.org/'})
  })

  it('should ignore other json-ld reserved words', function () {
    var prefixes = rdfprefix({
      '@base': 'http://www.example.org/',
      'schema': 'http://schema.org/',
      'schema:sameAs': { '@container': '@set' }
    })
    expect(prefixes.toJSON()).to.be.eql({ 'schema': 'http://schema.org/' })
  })

  describe('#(prefix)', function () {
    it('should provide a prefix function', function () {
      var prefixes = rdfprefix({
        'schema': 'http://schema.org/'
      })
      var schema = prefixes('schema')
      expect(schema('name')).to.be.eql('http://schema.org/name')
    })

    it('should be a passthrough if the prefix is undefined and tolerant=true', function () {
      var prefixes = rdfprefix()
      var schema = prefixes('schema')
      expect(schema('name', true)).to.be.eql('schema:name')
    })

    it('should throw if the prefix property contain a `:` char', function () {
      var prefixes = rdfprefix({
        'schema': 'http://schema.org/'
      })
      var schema = prefixes('schema')
      expect(function () {
        schema('any:name')
      }).to.throwError()
    })

    it('should throw if the prefix is undefined and tolerant=false|undefined', function () {
      var prefixes = rdfprefix()
      var schema = prefixes('schema')
      expect(function () {
        schema('name')
      }).to.throwError()
    })
  })

  it('#(prefix) should provide a prefix function', function () {

  })

  describe('#expand(name)', function () {
    it('should expand a prefixed iri', function () {
      var prefixes = rdfprefix({ 'schema': 'http://schema.org/' })
      expect(prefixes.expand('schema:name')).to.be.eql('http://schema.org/name')
    })

    it('should expand a prefixed iri (match property)', function () {
      var prefixes = rdfprefix({ 'schema': 'http://schema.org/' })
      expect(prefixes.expand('schema')).to.be.eql('http://schema.org/')
    })

    it('should expand a property using the vocabulary', function () {
      var prefixes = rdfprefix({ '@vocab': 'http://schema.org/' })
      expect(prefixes.expand('name')).to.be.eql('http://schema.org/name')
    })

    it('should use the defined prefix over the default vocabulary', function () {
      var prefixes = rdfprefix({
        '@vocab': 'http://schema.org/',
        'name': 'http://www.example.org/name' // Will be used over @vocab
      })
      expect(prefixes.expand('name')).to.be.eql('http://www.example.org/name')
    })

    it('act as a passthrough if the prefix is undefined and tolerant=true', function () {
      var prefixes = rdfprefix()
      expect(prefixes.expand('schema:name', true)).to.be.eql('schema:name')
    })

    it('act as a passthrough if the name is note a prefixed iri', function () {
      var prefixes = rdfprefix()
      expect(prefixes.expand('http://www.example.org/play')).to.be.eql('http://www.example.org/play')
    })

    it('should throw if the prefix does not exists and tolerant=false|undefined', function () {
      var prefixes = rdfprefix()
      expect(function () {
        prefixes.expand('schema:name')
      }).to.throwError()
    })

    it('should throw if no prefix or vocab is found and tolerant=false|undefined', function () {
      var prefixes = rdfprefix()
      expect(function () {
        prefixes.expand('name')
      }).to.throwError()
    })
  })

  describe('#compact(iri)', function () {
    it('should compact an iri if a prefix is found', function () {
      var prefixes = rdfprefix({ 'schema': 'http://schema.org/' })
      expect(prefixes.compact('http://schema.org/name')).to.be.eql('schema:name')
    })

    it('should compact an iri if a prefix is found (is the prefix)', function () {
      var prefixes = rdfprefix({ 'schema': 'http://schema.org/' })
      expect(prefixes.compact('http://schema.org/')).to.be.eql('schema')
    })

    it('should compact an iri based on vocabulary', function () {
      var prefixes = rdfprefix({
        '@vocab': 'http://schema.org/',
        'example': 'http://example.org/',
        'name': 'example:name'
      })
      expect(prefixes.compact('http://example.org/name')).to.be.eql('name')
      expect(prefixes.expand(prefixes.compact('http://example.org/name'))).to.be.eql('http://example.org/name')
    })

    it('should use prefix over vocabulary', function () {
      var prefixes = rdfprefix({
        '@vocab': 'http://schema.org/',
        'example': 'http://example.org/',
        'name': 'example:name'
      })
      expect(prefixes.expand(prefixes.compact('http://example.org/name'))).to.be.eql('http://example.org/name')
    })
  })

  describe('#toJSON()', function () {
    it('should return a serializable copy of prefixes (without @vocab or other json-ld properties)', function () {
      var prefixes = rdfprefix({
        '@base': 'http://example.org/',
        '@vocab': 'http://schema.org/',
        'schema': 'http://schema.org/',
        'schema:sameAs': { '@container': '@set' },
        'label': { '@id': 'schema:name' }
      })
      expect(prefixes.toJSON()).to.be.eql({
        'schema': 'http://schema.org/',
        'label': 'http://schema.org/name'
      })
    })
  })

  describe('#toContext()', function () {
    it('should return a serializable copy of prefixes (with @vocab)', function () {
      var prefixes = rdfprefix({
        '@base': 'http://example.org/',
        '@vocab': 'http://schema.org/',
        'schema': 'http://schema.org/',
        'schema:sameAs': { '@container': '@set' },
        'label': { '@id': 'schema:name' }
      })
      expect(prefixes.toContext()).to.be.eql({
        '@vocab': 'http://schema.org/',
        'schema': 'http://schema.org/',
        'label': 'http://schema.org/name'
      })
    })
  })
})
