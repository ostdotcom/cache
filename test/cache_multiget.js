// Load external packages
const chai = require('chai')
  , assert = chai.assert;

// Load cache service
const rootPrefix = ".."
  , openSTCache = require(rootPrefix + '/services/cache')
  , cacheConfig = require(rootPrefix + '/config/cache')
;

describe('Cache MultiGet', function() {

  it('should return promise', async function() {
    var cKey = ["cache-key"]
      , response = openSTCache.multiGet(cKey);
    assert.typeOf(response, 'Promise');
  });

  it('should fail when key is not passed', async function() {
    var response = await openSTCache.multiGet();
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key is empty array', async function() {
    var response = await openSTCache.multiGet([]);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key is undefined', async function() {
    var response = await openSTCache.multiGet([undefined]);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key is blank', async function() {
    var cKey = ['']
      , response = await openSTCache.multiGet(cKey);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key is number', async function() {
    var cKey = [10]
      , response = await openSTCache.multiGet(cKey);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key has space', async function() {
    var cKey = ["a b"]
      , response = await openSTCache.multiGet(cKey);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key length is > 250 bytes', async function() {
    var cKey = [Array(252).join('x')]
      , response = await openSTCache.multiGet(cKey);
    assert.equal(response.isSuccess(), false);
  });

  it('should pass when value is not set', async function() {
    var cKey = ["cache-key-not-set"]
      , response = await openSTCache.multiGet(cKey);
    assert.equal(response.isSuccess(), true);
    assert.equal(response.data.response["cache-key-not-set"], null);
  });

  it('should pass when non object values are get', async function() {
    var keyValue = {
      "cache-key-string": "String Value",
      "cache-key-integer": 10,
      "cache-key-blank": ""
    };

    for(var key in keyValue) {
      res = await openSTCache.set(key, keyValue[key]);
    }

    var lookupKeys = Object.keys(keyValue)
      , response = await openSTCache.multiGet(lookupKeys);

    assert.equal(response.isSuccess(), true);
    for(var key in response.data.response) {
      assert.equal(response.data.response[key], keyValue[key]);
    };

  });

  it('should return null when object values are get', async function() {
    var keyValue = {
      "cache-key-array": [1,2,3,4],
      "cache-key-object": {a: 1}
    };

    for(var key in keyValue) {
      res = await openSTCache.set(key, keyValue[key]);
    }

    var lookupKeys = Object.keys(keyValue)
      , response = await openSTCache.multiGet(lookupKeys);

    assert.equal(response.isSuccess(), true);
    for(var key in response.data.response) {
      assert.equal(response.data.response[key], null);
    };

  });

});