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
  describe('Cache Set ' + keySuffix, function() {

    keySuffix = keySuffix + "_" + (new Date()).getTime();

    it('should return promise', async function() {
      var cKey = "cache-key" + keySuffix
        , cValue = "String Value"
        , response = cahceObj.set(cKey, cValue);
      assert.typeOf(response, 'Promise');
    });

    it('should fail when key/value is not passed', async function() {
      var response = await cahceObj.set();
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key is undefined', async function() {
      var cValue = "String Value"
        , response = await cahceObj.set(undefined, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key is blank', async function() {
      var cKey = ''
        , cValue = "String Value"
        , response = await cahceObj.set(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key is number', async function() {
      var cKey = 10
        , cValue = "String Value"
        , response = await cahceObj.set(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key has space', async function() {
      var cKey = "a b" + keySuffix
        , cValue = "String Value"
        , response = await cahceObj.set(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key length is > 250 bytes', async function() {
      var cKey = Array(252).join('x')
        , cValue = "String Value"
        , response = await cahceObj.set(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    if (engineType != 'redis') {
      it('should pass when value is Object', async function() {
        var cKey = "cache-key" + keySuffix
          , cValue = {a: 1}
          , response = await cahceObj.set(cKey, cValue);
        assert.equal(response.isSuccess(), true);
        assert.equal(response.data.response, true);
      });
    } else {
      it('should fail when value is Object', async function() {
        var cKey = "cache-key" + keySuffix
          , cValue = {a: 1}
          , response = await cahceObj.set(cKey, cValue);
        assert.equal(response.isSuccess(), false);
      });
    }

    it('should fail when value is undefined', async function() {
      var cKey = "cache-key" + keySuffix
        , response = await cahceObj.set(cKey);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when value size is > 1 MB', async function() {
      var cKey = "cache-key" + keySuffix
        , cValue = Array(1050000).join('x')
        , response = await cahceObj.set(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should pass when value is string', async function() {
      var cKey = "cache-key" + keySuffix
        , cValue = "String Value"
        , response = await cahceObj.set(cKey, cValue);
      assert.equal(response.isSuccess(), true);
      assert.equal(response.data.response, true);
    });

    it('should pass when value is integer', async function() {
      var cKey = "cache-key" + keySuffix
        , cValue = 10
        , response = await cahceObj.set(cKey, cValue);
      assert.equal(response.isSuccess(), true);
      assert.equal(response.data.response, true);
    });

    it('should pass when value is blank', async function() {
      var cKey = "cache-key" + keySuffix
        , cValue = ""
        , response = await cahceObj.set(cKey, cValue);
      assert.equal(response.isSuccess(), true);
      assert.equal(response.data.response, true);
    });

    it('should delete from cache after ttl', async function() {
      var cKey = "cache-key" + keySuffix
        , cValue = 10
        , ttl = 6 // seconds
        , response = await cahceObj.set(cKey, cValue, ttl);
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
}

openSTCache = openSTCacheKlass.getInstance(configStrategy);
cacheImplementer = openSTCache.cacheInstance;

performTest(cacheImplementer, "ConsistentBehaviour");
performTest(cacheImplementer, "InconsistentBehaviour");
