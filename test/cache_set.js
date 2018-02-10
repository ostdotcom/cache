// Load external packages
const chai = require('chai')
  , assert = chai.assert;

// Load cache service
const rootPrefix = ".."
  , openSTCache = require(rootPrefix + '/services/cache')
  , cacheConfig = require(rootPrefix + '/config/cache')
;

describe('Cache Set', function() {

  it('should return promise', async function() {
    var cKey = "cache-key"
      , cValue = "String Value"
      , response = openSTCache.set(cKey, cValue);
    assert.typeOf(response, 'Promise');
  });

  it('should fail when key/value is not passed', async function() {
    var response = await openSTCache.set();
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key is undefined', async function() {
    var cValue = "String Value"
      , response = await openSTCache.set(undefined, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key is blank', async function() {
    var cKey = ''
      , cValue = "String Value"
      , response = await openSTCache.set(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key is number', async function() {
    var cKey = 10
      , cValue = "String Value"
      , response = await openSTCache.set(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key has space', async function() {
    var cKey = "a b"
      , cValue = "String Value"
      , response = await openSTCache.set(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key length is > 250 bytes', async function() {
    var cKey = Array(252).join('x')
      , cValue = "String Value"
      , response = await openSTCache.set(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  if (cacheConfig.CACHING_ENGINE != 'redis') {
    it('should pass when value is Object', async function() {
      var cKey = "cache-key"
        , cValue = {a: 1}
        , response = await openSTCache.set(cKey, cValue);
      assert.equal(response.isSuccess(), true);
      assert.equal(response.data.response, true);
    });
  } else {
    it('should fail when value is Object', async function() {
      var cKey = "cache-key"
        , cValue = {a: 1}
        , response = await openSTCache.set(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });
  }

  it('should fail when value is undefined', async function() {
    var cKey = "cache-key"
      , response = await openSTCache.set(cKey);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when value size is > 1 MB', async function() {
    var cKey = "cache-key"
      , cValue = Array(1050000).join('x')
      , response = await openSTCache.set(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should pass when value is string', async function() {
    var cKey = "cache-key"
      , cValue = "String Value"
      , response = await openSTCache.set(cKey, cValue);
    assert.equal(response.isSuccess(), true);
    assert.equal(response.data.response, true);
  });

  it('should pass when value is integer', async function() {
    var cKey = "cache-key"
      , cValue = 10
      , response = await openSTCache.set(cKey, cValue);
    assert.equal(response.isSuccess(), true);
    assert.equal(response.data.response, true);
  });

  it('should pass when value is blank', async function() {
    var cKey = "cache-key"
      , cValue = ""
      , response = await openSTCache.set(cKey, cValue);
    assert.equal(response.isSuccess(), true);
    assert.equal(response.data.response, true);
  });

  it('should delete from cache after ttl', async function() {
    var cKey = "cache-key"
        , cValue = 10
        , ttl = 6 // seconds
        , response = await openSTCache.set(cKey, cValue, ttl);
    assert.equal(response.isSuccess(), true);
    assert.equal(response.data.response, true);
    setTimeout(async function(){
      response = await openSTCache.get(cKey);
      assert.equal(response.isSuccess(), true);
      assert.equal(response.data.response, null);
      }, ttl * 1000
    );
  });

});