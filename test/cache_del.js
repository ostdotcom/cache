// Load external packages
const chai = require('chai')
  , assert = chai.assert;

// Load cache service
const rootPrefix = ".."
  , openSTCacheKlass = require(rootPrefix + '/index')
  , testCachingEngine = process.env.OST_CACHING_ENGINE
;

let configStrategy;
if (testCachingEngine == 'redis') {
  configStrategy = require(rootPrefix + '/test/env/redis.json')
}
else if (testCachingEngine == 'memcached') {
  configStrategy = require(rootPrefix + '/test/env/memcached.json')
}
else if (testCachingEngine == 'none') {
  configStrategy = require(rootPrefix + '/test/env/in-memory.json')
}

const engineType = configStrategy.OST_CACHING_ENGINE
;

function performTest (cahceObj, keySuffix) {

  describe('Cache Del '+ keySuffix, function() {

    keySuffix = keySuffix + "_" + (new Date()).getTime();

    it('should return promise', async function() {
      var cKey = "cache-key" + keySuffix
        , response = cahceObj.del(cKey);
      assert.typeOf(response, 'Promise');
    });

    it('should fail when key/value is not passed', async function() {
      var response = await cahceObj.del();
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key is undefined', async function() {
      var response = await cahceObj.del(undefined);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key is blank', async function() {
      var cKey = ''
        , response = await cahceObj.del(cKey);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key is number', async function() {
      var cKey = 10
        , response = await cahceObj.del(cKey);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key has space', async function() {
      var cKey = "a b" + keySuffix
        , response = await cahceObj.del(cKey);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key length is > 250 bytes', async function() {
      var cKey = Array(252).join('x')
        , response = await cahceObj.del(cKey);
      assert.equal(response.isSuccess(), false);
    });

    it('should pass when key is not set', async function() {
      var cKey = "cache-key-not-key-del" + keySuffix
        , response = await cahceObj.del(cKey);
      assert.equal(response.isSuccess(), true);
      assert.equal(response.data.response, true);
    });

    it('should pass when key is set', async function() {
      var cKey = "cache-key" + keySuffix
        , cValue = "String Value"
        , responseSet = await cahceObj.set(cKey, cValue)
        , response = await cahceObj.del(cKey);
      assert.equal(response.isSuccess(), true);
      assert.equal(response.data.response, true);
    });

  });

}

openSTCache = openSTCacheKlass.getInstance(configStrategy);
cacheImplementer = openSTCache.cacheInstance;

performTest(cacheImplementer, "ConsistentBehaviour");
performTest(cacheImplementer, "InconsistentBehaviour");
