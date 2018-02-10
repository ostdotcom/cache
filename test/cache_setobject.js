// Load external packages
const chai = require('chai')
  , assert = chai.assert;

// Load cache service
const rootPrefix = ".."
  , openSTCache = require(rootPrefix + '/services/cache')
  , cacheConfig = require(rootPrefix + '/config/cache')
;

describe('Cache SetObject', function() {

  it('should return promise', async function() {
    var cKey = "cache-key-object"
      , cValue = {a: 1}
      , response = openSTCache.setObject(cKey, cValue);
    assert.typeOf(response, 'Promise');
  });

  it('should fail when key/value is not passed', async function() {
    var response = await openSTCache.setObject();
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key is undefined', async function() {
    var cValue = {a: 1}
      , response = await openSTCache.setObject(undefined, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key is blank', async function() {
    var cKey = ''
      , cValue = {a: 1}
      , response = await openSTCache.setObject(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key is number', async function() {
    var cKey = 10
      , cValue = {a: 1}
      , response = await openSTCache.setObject(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key has space', async function() {
    var cKey = "a b"
      , cValue = {a: 1}
      , response = await openSTCache.setObject(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key length is > 250 bytes', async function() {
    var cKey = Array(252).join('x')
      , cValue = {a: 1}
      , response = await openSTCache.setObject(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when value is not Object', async function() {
    var cKey = "cache-key-object"
      , cValue = "cache-value"
      , response = await openSTCache.setObject(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when value is undefined', async function() {
    var cKey = "cache-key-object"
      , response = await openSTCache.setObject(cKey);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when value size is > 1 MB', async function() {
    var cKey = "cache-key-object"
      , cValue = {a: Array(1050000).join('x')}
      , response = await openSTCache.setObject(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when value is string', async function() {
    var cKey = "cache-key-object"
      , cValue = "String Value"
      , response = await openSTCache.setObject(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when value is integer', async function() {
    var cKey = "cache-key-object"
      , cValue = 10
      , response = await openSTCache.setObject(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when value is blank', async function() {
    var cKey = "cache-key-object"
      , cValue = ""
      , response = await openSTCache.setObject(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when value is Array', async function() {
    var cKey = "cache-key-object"
      , cValue = [12,23]
      , response = await openSTCache.setObject(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should pass when value is object', async function() {
    var cKey = "cache-key-object"
      , cValue = {a: 'a'}
      , response = await openSTCache.setObject(cKey, cValue);
    assert.equal(response.isSuccess(), true);
    assert.equal(response.data.response, true);
  });

  it('should pass when value is complex object', async function() {
    var cKey = "cache-key-object"
      , cValue = {a: 'a', b: [12,23], c: true, d: 1}
      , response = await openSTCache.setObject(cKey, cValue);
    assert.equal(response.isSuccess(), true);
    assert.equal(response.data.response, true);
  });

  it('should delete from cache after ttl (if cache engine is not redis)', async function() {
    var cKey = "cache-key"
        , cValue = {a: 'a', b: [12,23], c: true, d: 1}
        , ttl = 6 // seconds
        , response = await openSTCache.setObject(cKey, cValue, ttl);
    setTimeout(async function(){
        response = await openSTCache.getObject(cKey);
        assert.equal(response.isSuccess(), true);
        if (cacheConfig.CACHING_ENGINE != 'redis') {
          assert.equal(response.data.response, null);
        } else {
          assert.equal(response.data.response, true);
        }
      }, ttl * 1000
    );
  });

});