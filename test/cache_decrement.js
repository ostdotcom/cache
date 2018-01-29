// Load external packages
const chai = require('chai')
  , assert = chai.assert;

// Load cache service
const rootPrefix = ".."
  , openSTCache = require(rootPrefix + '/services/cache')
  , cacheConfig = require(rootPrefix + '/config/cache')
;

describe('Cache Decrement', function() {

  it('should return promise', async function() {
    var cKey = "cache-key-decr-counter"
      , cValue = 1
      , response = openSTCache.decrement(cKey, cValue);
    assert.typeOf(response, 'Promise');
  });

  it('should fail when key/value is not passed', async function() {
    var response = await openSTCache.decrement();
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key is undefined', async function() {
    var cValue = 1
      , response = await openSTCache.decrement(undefined, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key is blank', async function() {
    var cKey = ''
      , cValue = 1
      , response = await openSTCache.decrement(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key is number', async function() {
    var cKey = 10
      , cValue = 1
      , response = await openSTCache.decrement(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key has space', async function() {
    var cKey = "a b"
      , cValue = 1
      , response = await openSTCache.decrement(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key length is > 250 bytes', async function() {
    var cKey = Array(252).join('x')
      , cValue = 1
      , response = await openSTCache.decrement(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when value is Object', async function() {
    var cKey = "cache-key-decr-counter"
      , cValue = {a: 1}
      , response = await openSTCache.decrement(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when value is blank', async function() {
    var cKey = "cache-key-decr-counter"
      , cValue = ""
      , response = await openSTCache.decrement(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when value is string', async function() {
    var cKey = "cache-key-decr-counter"
      , cValue = "String Value"
      , response = await openSTCache.decrement(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key has non numeric value', async function() {
    var cKey = "cache-key-decr-non-numeric"
      , cValue = "hi"
      , response = await openSTCache.set(cKey, cValue);
    assert.equal(response.isSuccess(), true);

    cValue = 10
    response = await openSTCache.decrement(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key does not exist', async function() {
    var cKey = "cache-key-decr-counter-not-exist"
      , cValue = 10
      , response = await openSTCache.decrement(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should pass incremented by multiple integer values', async function() {
    var cKey = "cache-key-decr-counter-key"
      , cValue = 10000
      , response = await openSTCache.set(cKey, cValue);
    assert.equal(response.isSuccess(), true);

    // decrement by default value
    resObj = await openSTCache.decrement(cKey);
    assert.equal(resObj.isSuccess(), true);
    cValue -= 1;
    assert.equal(resObj.data.response, cValue);

    // decrement by negative value
    resObj = await openSTCache.decrement(cKey, -1);
    assert.equal(resObj.isSuccess(), false);

    // decrement by float value
    resObj = await openSTCache.decrement(cKey, 1.2);
    assert.equal(resObj.isSuccess(), false);

    // decrement by 1
    var incrementBy = [1, 3, 2, 10, 100, 57];
    for (var i=0; i < incrementBy.length; i++) {
      resObj = await openSTCache.decrement(cKey, incrementBy[i]);
      assert.equal(resObj.isSuccess(), true);
      cValue -= incrementBy[i];
      assert.equal(resObj.data.response, cValue);
    }

    // decrement by bigger number value
    resObj = await openSTCache.decrement(cKey, 100000000);
    assert.equal(resObj.isSuccess(), true);
    cValue = 0;
    assert.equal(resObj.data.response, cValue);

  });

});