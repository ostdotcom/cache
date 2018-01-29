// Load external packages
const chai = require('chai')
  , assert = chai.assert;

// Load cache service
const rootPrefix = ".."
  , openSTCache = require(rootPrefix + '/services/cache')
  , cacheConfig = require(rootPrefix + '/config/cache')
;

describe('Cache Get', function() {

  it('should return promise', function() {
    var cKey = "cache-key"
      , response = openSTCache.get(cKey);
    assert.typeOf(response, 'Promise');
  });

  it('should fail when key is not passed', async function() {
    var response = await openSTCache.get();
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key is undefined', async function() {
    var response = await openSTCache.get(undefined);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key is blank', async function() {
    var cKey = ''
      , response = await openSTCache.get(cKey);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key is number', async function() {
    var cKey = 10
      , response = await openSTCache.get(cKey);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key has space', async function() {
    var cKey = "a b"
      , response = await openSTCache.get(cKey);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key length is > 250 bytes', async function() {
    var cKey = Array(252).join('x')
      , response = await openSTCache.get(cKey);
    assert.equal(response.isSuccess(), false);
  });

  it('should pass when value is not get', async function() {
    var cKey = "cache-key-not-get"
      , response = await openSTCache.get(cKey);
    assert.equal(response.isSuccess(), true);
    assert.equal(response.data.response, null);
  });

  it('should pass when value is string', async function() {
    var cKey = "cache-key"
      , cValue = "String Value"
      , responseSet = await openSTCache.set(cKey, cValue)
      , response = await openSTCache.get(cKey);
    assert.equal(response.isSuccess(), true);
    assert.equal(response.data.response, cValue);
  });

  it('should pass when value is integer', async function() {
    var cKey = "cache-key"
      , cValue = 10
      , responseSet = await openSTCache.set(cKey, cValue)
      , response = await openSTCache.get(cKey);
    assert.equal(response.isSuccess(), true);
    assert.equal(response.data.response, cValue);
  });

  it('should pass when value is blank', async function() {
    var cKey = "cache-key"
      , cValue = ""
      , responseSet = await openSTCache.set(cKey, cValue)
      , response = await openSTCache.get(cKey);
    assert.equal(response.isSuccess(), true);
    assert.equal(response.data.response, cValue);
  });

  if (cacheConfig.CACHING_ENGINE != 'redis') {
    it('should pass when value is Object', async function() {
      var cKey = "cache-key-object"
        , cValue = {a: 1}
        , responseSet = await openSTCache.set(cKey, cValue)
        , response = await openSTCache.get(cKey);
      assert.equal(response.isSuccess(), true);
      assert.equal(typeof response.data.response, typeof cValue);
      assert.equal(JSON.stringify(response.data.response), JSON.stringify(cValue));
    });

    it('should pass when value is Array', async function() {
      var cKey = "cache-key-object"
        , cValue = [1,2,3,4]
        , responseSet = await openSTCache.set(cKey, cValue)
        , response = await openSTCache.get(cKey);
      assert.equal(response.isSuccess(), true);
      assert.equal(typeof response.data.response, typeof cValue);
      assert.equal(JSON.stringify(response.data.response), JSON.stringify(cValue));
    });
  } else {
    it('should fail when value is Object', async function() {
      var cKey = "cache-key-object"
        , cValue = {a: 1}
        , responseSet = await openSTCache.setObject(cKey, cValue)
        , response = await openSTCache.get(cKey);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when value is Array', async function() {
      var cKey = "cache-key-object"
        , cValue = [1,2,3,4]
        , responseSet = await openSTCache.set(cKey, cValue)
        , response = await openSTCache.get(cKey);
      assert.equal(response.isSuccess(), false);
    });
  }

});