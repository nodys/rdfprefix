# rdfprefix
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)
[![travis][travis-image]][travis-url]
[![npm][npm-image]][npm-url]
[![downloads][downloads-image]][downloads-url]

[travis-image]: https://img.shields.io/travis/nodys/rdfprefix.svg?style=flat&branch=master
[travis-url]: https://travis-ci.org/nodys/rdfprefix
[npm-image]: https://img.shields.io/npm/v/rdfprefix.svg?style=flat
[npm-url]: https://npmjs.org/package/rdfprefix
[downloads-image]: https://img.shields.io/npm/dm/rdfprefix.svg?style=flat
[downloads-url]: https://npmjs.org/package/rdfprefix

RDF and Json-ld prefix utility

## Features

  - Expand prefixed iri to iri
  - Compact iri to prefixed iri
  - Support JSON-LD context as prefix definition

## Installation

```shell
npm install --save rdfprefix
```

## Usage

```javascript
var rdfprefix = require('rdfprefix')

// Basic initialization
var prefixes = rdfprefix()

// Initialize with prefixes
var prefixes = rdfprefix({schema: 'http://schema.org'})

// Initialize with an array of prefixes
var prefixes = rdfprefix([
  {owl: 'http://www.w3.org/2002/07/owl#'},
  {schema: 'http://schema.org/'}
])

// Supports Json-ld @context
var prefixes = rdfprefix({
  '@vocab': 'http://purl.org/dc/terms/',
  'schema': 'http://schema.org/',
  'displayName': 'schema:name',
  'alias': {
    '@id': 'schema:alternateName',
    '@container': '@set'
  },
  'schema:sameAs': {
    '@type': 'schema:URL',
    '@container': '@set'
  }
})

// Add prefixes...
prefixes('owl', 'http://www.w3.org/2002/07/owl#')
prefixes({
  'cc': 'http://creativecommons.org/ns#',
  'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
  'Class': 'rdfs:Class'
})

// Use prefixes
var schema = prefixes('schema')
schema('name') // -> 'http://schema.org/name'

// Expand prefixed iri
prefixes.expand('schema:name') // -> 'http://schema.org/name'
prefixes.expand('abstract') // -> 'http://purl.org/dc/terms/abstract' (see '@vocab')
prefixes.expand('http://www.exemple.org/play') // -> 'http://www.exemple.org/play'
prefixes.expand('undefinedprefix:foo') // -> throw Error()
prefixes.expand('undefinedprefix:foo', true) // -> 'undefinedprefix:foo' (tolerant = true)

// Compact iri
prefix.compact('http://schema.org/name') // -> 'schema:name'
prefix.compact('http://purl.org/dc/terms/abstract') // -> 'abstract' (see '@vocab')
prefix.compact('http://www.exemple.org/play') // -> 'http://www.exemple.org/play'

// Get a serializable copy of prefixes
prefix.toJSON() // -> { schema: 'http://schema.org/', ... } (without '@vocab')

// Like toJSON but with the '@vocab' prefix if any
prefix.toContext() // -> { '@vocab': 'http://purl.org/dc/terms/abstract', schema: ... }

```

## Test coverage

|  |  |
| ------------ | -------------- |
| Statements   | 100% ( 76/76 ) |
| Branches     | 100% ( 52/52 ) |
| Functions    | 100% ( 14/14 ) |
| Lines        | 100% ( 76/76 ) |


## Credit & great tools

  - See the fabulous [N3](https://github.com/RubenVerborgh/N3.js) library by @RubenVerborgh
  - The must have [jsonld.js](https://github.com/digitalbazaar/jsonld.js) library

---

[The MIT License](./LICENSE) • By [Novadiscovery](http://www.novadiscovery.com/)
