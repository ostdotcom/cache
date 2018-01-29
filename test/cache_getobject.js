// Load external packages
const chai = require('chai')
  , assert = chai.assert;

// Load cache service
const rootPrefix = ".."
  , openSTCache = require(rootPrefix + '/services/cache')
  , cacheConfig = require(rootPrefix + '/config/cache')
;

describe('Cache GetObject', function() {

  it('should return promise', async function() {
    var cKey = "cache-key-object"
      , response = openSTCache.getObject(cKey);
    assert.typeOf(response, 'Promise');
  });

  it('should fail when key/value is not passed', async function() {
    var response = await openSTCache.getObject();
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key is undefined', async function() {
    var response = await openSTCache.getObject(undefined);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key is blank', async function() {
    var cKey = ''
      , response = await openSTCache.getObject(cKey);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key is number', async function() {
    var cKey = 10
      , response = await openSTCache.getObject(cKey);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key has space', async function() {
    var cKey = "a b"
      , response = await openSTCache.getObject(cKey);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key length is > 250 bytes', async function() {
    var cKey = Array(252).join('x')
      , response = await openSTCache.getObject(cKey);
    assert.equal(response.isSuccess(), false);
  });

  it('should pass when value is not set', async function() {
    var cKey = "cache-key-not-set"
      , response = await openSTCache.getObject(cKey);
    assert.equal(response.isSuccess(), true);
    assert.equal(response.data.response, null);
  });

  it('should pass when value is object', async function() {
    var cKey = "cache-key-object"
      , cValue = {a: 'a'}
      , responseSet = await openSTCache.setObject(cKey, cValue)
      , response = await openSTCache.getObject(cKey);
    assert.equal(response.isSuccess(), true);
    assert.equal(typeof response.data.response, typeof cValue);
    assert.equal(JSON.stringify(response.data.response), JSON.stringify(cValue));
  });

  it('should pass when value is complex object', async function() {
    var cKey = "cache-key-object"
      , cValue = {a: 'a', b: [12,23], c: true, d: 1, e: {f: "hi", g: 1}}
      , responseSet = await openSTCache.setObject(cKey, cValue)
      , response = await openSTCache.getObject(cKey);
    assert.equal(response.isSuccess(), true);
    assert.equal(typeof response.data.response, typeof cValue);
    assert.equal(JSON.stringify(response.data.response), JSON.stringify(cValue));
  });

});