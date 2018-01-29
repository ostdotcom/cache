// Load external packages
const chai = require('chai')
  , assert = chai.assert;

// Load cache service
const rootPrefix = ".."
  , openSTCache = require(rootPrefix + '/services/cache')
  , cacheConfig = require(rootPrefix + '/config/cache')
;

describe('Cache Touch', function() {

  it('should return promise', async function() {
    var cKey = "cache-key-touch"
      , cValue = 100
      , response = openSTCache.touch(cKey, cValue);
    assert.typeOf(response, 'Promise');
  });

  it('should fail when key/expiry is not passed', async function() {
    var response = await openSTCache.touch();
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key is undefined', async function() {
    var cValue = 100
      , response = await openSTCache.touch(undefined, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key is blank', async function() {
    var cKey = ''
      , cValue = 100
      , response = await openSTCache.touch(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key is number', async function() {
    var cKey = 10
      , cValue = 100
      , response = await openSTCache.touch(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key has space', async function() {
    var cKey = "a b"
      , cValue = 100
      , response = await openSTCache.touch(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key length is > 250 bytes', async function() {
    var cKey = Array(252).join('x')
      , cValue = 100
      , response = await openSTCache.touch(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when expiry is Object', async function() {
    var cKey = "cache-key-touch"
      , cValue = {a: 1}
      , response = await openSTCache.touch(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when expiry is blank', async function() {
    var cKey = "cache-key-touch"
      , cValue = ""
      , response = await openSTCache.touch(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when expiry is string', async function() {
    var cKey = "cache-key-touch"
      , cValue = "String Value"
      , response = await openSTCache.touch(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when key does not exist', async function() {
    var cKey = "cache-key-touch-not-exist"
      , cValue = 100
      , response = await openSTCache.touch(cKey, cValue);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when expiry is negative secs', async function() {
    var cKey = "cache-key-touch"
      , cValue = "my value"
      , response = await openSTCache.set(cKey, cValue);
    assert.equal(response.isSuccess(), true);

    // touch by negative value
    expiry = -1;
    resObj = await openSTCache.touch(cKey, expiry);
    assert.equal(resObj.isSuccess(), false);
  });

  it('should pass when expiry is 100 secs', async function() {
    var cKey = "cache-key-touch"
      , cValue = "my value"
      , response = await openSTCache.set(cKey, cValue);
    assert.equal(response.isSuccess(), true);

    // touch by positive value
    expiry = 100;
    resObj = await openSTCache.touch(cKey, expiry);
    assert.equal(resObj.isSuccess(), true);
  });

  it('should pass when expiry is 0 secs', async function() {
    var cKey = "cache-key-touch"
      , cValue = "my value"
      , response = await openSTCache.set(cKey, cValue);
    assert.equal(response.isSuccess(), true);

    // touch by 0 value
    expiry = 0;
    resObj = await openSTCache.touch(cKey, expiry);
    assert.equal(resObj.isSuccess(), true);

    // check if key deleted
    resObj = await openSTCache.get(cKey);
    assert.equal(resObj.isSuccess(), true);
    assert.equal(resObj.data.response, null);

  });

});