// Load external packages
const chai = require('chai')
  , assert = chai.assert;

// Load cache service
const rootPrefix = ".."
  , openSTCache = require(rootPrefix + '/services/cache')
  , cacheConfig = require(rootPrefix + '/config/cache')
;

describe('Cache Del', function() {

  it('should return promise', async function() {
    var cKey = "cache-key"
      , response = openSTCache.del(cKey);
    assert.typeOf(response, 'Promise');
  });

  it('should fail when key/value is not passed', async function() {
    var response = await openSTCache.del();
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key is undefined', async function() {
    var response = await openSTCache.del(undefined);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key is blank', async function() {
    var cKey = ''
      , response = await openSTCache.del(cKey);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key is number', async function() {
    var cKey = 10
      , response = await openSTCache.del(cKey);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key has space', async function() {
    var cKey = "a b"
      , response = await openSTCache.del(cKey);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key length is > 250 bytes', async function() {
    var cKey = Array(252).join('x')
      , response = await openSTCache.del(cKey);
    assert.equal(response.isSuccess(), false);
  });

  it('should pass when key is not set', async function() {
    var cKey = "cache-key-not-key-del"
      , response = await openSTCache.del(cKey);
    assert.equal(response.isSuccess(), true);
    assert.equal(response.data.response, true);
  });

  it('should pass when key is set', async function() {
    var cKey = "cache-key"
      , cValue = "String Value"
      , responseSet = await openSTCache.set(cKey, cValue)
      , response = await openSTCache.del(cKey);
    assert.equal(response.isSuccess(), true);
    assert.equal(response.data.response, true);
  });

});