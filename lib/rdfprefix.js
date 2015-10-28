'use strict'

module.exports = rdfprefix

/**
 * Create a prefixes manager
 *
 * See exemple in the readme.md
 *
 * @param  {Array.<Object>|Object} [init]
 *         Initialize prefixes with a prefixes hash or an array of prefixes hash
 *         Could be a Json-ld context objects or array
 *
 * @return {Function}
 *         A prefix manager
 */
function rdfprefix (init) {
  /**
   * Prefix storage
   * @type {Object}
   */
  var prefixes = {}

  /**
   * Default vocabulary
   * @type {String}
   */
  var vocabulary

  /**
   * The prefix manager
   * @param  {String|Object|Array.<Object>} [prefix]
   * @param  {String} iri
   * @return {Function}
   */
  function api (prefix, iri) {
    if (typeof prefix === 'object') {
      return api.addMany(prefix)
    }

    if (iri) {
      api.add(prefix, iri)
    }

    return function (property, strict) {
      if (/:/.test(property)) {
        throw new Error('Invalid argument, property must not contain a `:` char')
      } else {
        return api.expand(prefix + ':' + property, strict)
      }
    }
  }

  /**
   * Add many prefix
   *
   * @param {Object|Array.<Object>} list
   *        A prefix hash or an array of prefix hash
   */
  api.addMany = function (list) {
    if (Object.prototype.toString.call(list) !== '[object Array]') {
      list = [list]
    }

    list.forEach(function (init) {
      Object.keys(init).forEach(function (prefix) {
        api.add(prefix, init[prefix])
      })
    })

    return api
  }

  /**
   * Add a prefix
   *
   * @param {String} prefix
   *        If the prefix is `@vocab` then the default vocabulary is set to `iri`
   *
   * @param {String} iri
   * @return {Function} this
   */
  api.add = function (prefix, iri) {
    if (/^@/.test(prefix)) {
      if (prefix === '@vocab') {
        vocabulary = api.expand(iri, prefixes)
      }
      return
    }

    if (/:/.test(prefix)) {
      return
    }

    if (typeof iri === 'object' && typeof iri['@id'] === 'string') {
      iri = iri['@id']
    }

    prefixes[prefix] = api.expand(iri, false)

    return api
  }

  /**
   * Check that the given name is a prefixed iri
   * @param  {String}  name
   * @return {Boolean}
   */
  api.isPrefixedName = function (name) {
    return /^[^:\/"']*:[^:\/"']+$/.test(name)
  }

  /**
   * Expand the given prefixed name to iri
   *
   *     api.expand('schema:name') // -> 'http://schema.org/name' (with { schema: 'http://schema.org/' })
   *     api.expand('http://schema.org/name') // -> 'http://schema.org/name'
   *     api.expand('invalid:name') // -> 'invalid:name' (with `invalid` is not defined)
   *     api.expand('name') // -> 'http://www.exemple.org/name' (with {'@vocab': 'http://www.exemple.org/'})
   *
   * @param  {String} name
   * @param  {Boolean} [tolerant]
   *         Do not throw if the prefix is not found
   *
   * @return {String}
   */
  api.expand = function (name, tolerant) {
    // If is prefixed name
    if (api.isPrefixedName(name)) {
      var splitted = name.split(':')
      var candidate = prefixes[splitted[0]]
      if (candidate) {
        return candidate + splitted[1]
      } else {
        if (!tolerant) {
          throw new Error('Prefix for `' + name + '` is undefined')
        }
        return name
      }
    } else {
      if (prefixes[name]) {
        return prefixes[name]
      } else if (vocabulary && !/:/.test(name)) {
        return vocabulary + name
      } else {
        if (!tolerant && !/:/.test(name)) {
          throw new Error('Prefix for `' + name + '` is undefined')
        }
        return name
      }
    }
  }

  /**
   * Try to compact the given expanded iri to prefixed iri
   *
   *     api.compact('http://schema.org/name') // -> 'schema:name' (with {schema: 'http://schema.org/'})
   *     api.compact('schema:name') // -> 'schema:name'
   *     api.compact('http://www.example.org/name') // -> 'name'  (with {'@vocab': 'http://www.exemple.org/'})
   *
   * @param  {String} iri
   * @return {String}
   */
  api.compact = function (iri) {
    iri = api.expand(iri)
    var found = ''
    Object.keys(prefixes).forEach(function (prefix) {
      var candidate = prefixes[prefix]
      var sub = iri.slice(0, candidate.length)
      if ((sub === candidate) && (candidate.length > prefix.length)) {
        found = prefix
      }
    })
    if (vocabulary && (iri.slice(0, vocabulary.length) === vocabulary)) {
      return iri.slice(vocabulary.length)
    }
    if (found.length) {
      if (prefixes[found] === iri) {
        return found
      } else {
        return found + ':' + iri.slice(prefixes[found].length)
      }
    } else {
      return iri
    }
  }

  /**
   * Return a clean copy of prefixes hash
   *
   * @param {Boolean} [withVocab]
   *        add jsonld @vocab prefix (see api.toContext)
   *
   * @return {Object}
   */
  api.toJSON = function (withVocab) {
    var json = {}
    if (withVocab && vocabulary) {
      json['@vocab'] = vocabulary
    }
    Object.keys(prefixes).forEach(function (prefix) {
      json[prefix] = prefixes[prefix]
    })
    return json
  }

  /**
   * Return a clean copy of prefixes hash (with the JSON-LD @vocab if any)
   * @return {Object}
   */
  api.toContext = function () {
    return api.toJSON(true)
  }

  if (typeof init === 'object') {
    api(init)
  }

  return api
}
