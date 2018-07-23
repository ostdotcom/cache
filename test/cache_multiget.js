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

  describe('Cache MultiGet ' + keySuffix, function() {

    keySuffix = keySuffix + "_" + (new Date()).getTime();

    it('should return promise', async function() {
      var cKey = ["cache-key"+ keySuffix]
        , response = cahceObj.multiGet(cKey);
      assert.typeOf(response, 'Promise');
    });

    it('should fail when key is not passed', async function() {
      var response = await cahceObj.multiGet();
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key is empty array', async function() {
      var response = await cahceObj.multiGet([]);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key is undefined', async function() {
      var response = await cahceObj.multiGet([undefined]);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key is blank', async function() {
      var cKey = ['']
        , response = await cahceObj.multiGet(cKey);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key is number', async function() {
      var cKey = [10]
        , response = await cahceObj.multiGet(cKey);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key has space', async function() {
      var cKey = ["a b"+ keySuffix]
        , response = await cahceObj.multiGet(cKey);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key length is > 250 bytes', async function() {
      var cKey = [Array(252).join('x')]
        , response = await cahceObj.multiGet(cKey);
      assert.equal(response.isSuccess(), false);
    });

    it('should pass when value is not set', async function() {
      var cKey = ["cache-key-not-set"+ keySuffix]
        , response = await cahceObj.multiGet(cKey);
      assert.equal(response.isSuccess(), true);
      assert.equal(response.data.response["cache-key-not-set"], null);
    });

    it('should pass when non object values are get', async function() {
      var keyValue = {};

      keyValue[`cache-key-string${keySuffix}`] = "String Value";
      keyValue[`cache-key-integer${keySuffix}`] = 10;
      keyValue[`cache-key-blank${keySuffix}`] = "";


      for(var key in keyValue) {
        res = await cahceObj.set(key, keyValue[key]);
      }

      var lookupKeys = Object.keys(keyValue)
        , response = await cahceObj.multiGet(lookupKeys);

      assert.equal(response.isSuccess(), true);
      for(var key in response.data.response) {
        assert.equal(response.data.response[key], keyValue[key]);
      };

    });

    it('should return null when object values are get', async function() {
      var keyValue = {};
      keyValue[`cache-key-array${keySuffix}`] =  [1,2,3,4];
      keyValue[`cache-key-object${keySuffix}`] =  {a: 1};


      for(var key in keyValue) {
        res = await cahceObj.set(key, keyValue[key]);
      }

      var lookupKeys = Object.keys(keyValue)
        , response = await cahceObj.multiGet(lookupKeys);

      assert.equal(response.isSuccess(), true);
      for(var key in response.data.response) {
        assert.equal(response.data.response[key], null);
      };

    });

  });
}

openSTCache = openSTCacheKlass.getInstance(configStrategy);
cacheImplementer = openSTCache.cacheInstance;

performTest(cacheImplementer, "ConsistentBehaviour");
performTest(cacheImplementer, "InconsistentBehaviour");
