// Load external packages
const chai = require('chai'),
  assert = chai.assert;

// Load cache service
const rootPrefix = '..',
  openSTCacheKlass = require(rootPrefix + '/index'),
  testCachingEngine = process.env.TEST_CACHING_ENGINE;

let configStrategy;
if (testCachingEngine == 'redis') {
  configStrategy = require(rootPrefix + '/test/env/redis.json');
} else if (testCachingEngine == 'memcached') {
  configStrategy = require(rootPrefix + '/test/env/memcached.json');
} else if (testCachingEngine == 'none') {
  configStrategy = require(rootPrefix + '/test/env/in-memory.json');
}

const engineType = configStrategy.OST_CACHING_ENGINE;

function performTest(cahceObj, keySuffix) {
  describe('Cache Get ' + keySuffix, function() {
    keySuffix = keySuffix + '_' + new Date().getTime();

    it('should return promise', function() {
      var cKey = 'cache-key' + keySuffix,
        response = cahceObj.get(cKey);
      assert.typeOf(response, 'Promise');
    });

    it('should fail when key is not passed', async function() {
      var response = await cahceObj.get();
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key is undefined', async function() {
      var response = await cahceObj.get(undefined);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key is blank', async function() {
      var cKey = '',
        response = await cahceObj.get(cKey);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key is number', async function() {
      var cKey = 10,
        response = await cahceObj.get(cKey);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key has space', async function() {
      var cKey = 'a b' + keySuffix,
        response = await cahceObj.get(cKey);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key length is > 250 bytes', async function() {
      var cKey = Array(252).join('x'),
        response = await cahceObj.get(cKey);
      assert.equal(response.isSuccess(), false);
    });

    it('should pass when value is not get', async function() {
      var cKey = 'cache-key-not-get' + keySuffix,
        response = await cahceObj.get(cKey);
      assert.equal(response.isSuccess(), true);
      assert.equal(response.data.response, null);
    });

    it('should pass when value is string', async function() {
      var cKey = 'cache-key' + keySuffix,
        cValue = 'String Value',
        responseSet = await cahceObj.set(cKey, cValue),
        response = await cahceObj.get(cKey);
      assert.equal(response.isSuccess(), true);
      assert.equal(response.data.response, cValue);
    });

    it('should pass when value is integer', async function() {
      var cKey = 'cache-key' + keySuffix,
        cValue = 10,
        responseSet = await cahceObj.set(cKey, cValue),
        response = await cahceObj.get(cKey);
      assert.equal(response.isSuccess(), true);
      assert.equal(response.data.response, cValue);
    });

    it('should pass when value is blank', async function() {
      var cKey = 'cache-key' + keySuffix,
        cValue = '',
        responseSet = await cahceObj.set(cKey, cValue),
        response = await cahceObj.get(cKey);
      assert.equal(response.isSuccess(), true);
      assert.equal(response.data.response, cValue);
    });

    if (engineType != 'redis') {
      it('should pass when value is Object', async function() {
        var cKey = 'cache-key-object' + keySuffix,
          cValue = { a: 1 },
          responseSet = await cahceObj.set(cKey, cValue),
          response = await cahceObj.get(cKey);
        assert.equal(response.isSuccess(), true);
        assert.equal(typeof response.data.response, typeof cValue);
        assert.equal(JSON.stringify(response.data.response), JSON.stringify(cValue));
      });

      it('should pass when value is Array', async function() {
        var cKey = 'cache-key-object' + keySuffix,
          cValue = [1, 2, 3, 4],
          responseSet = await cahceObj.set(cKey, cValue),
          response = await cahceObj.get(cKey);
        assert.equal(response.isSuccess(), true);
        assert.equal(typeof response.data.response, typeof cValue);
        assert.equal(JSON.stringify(response.data.response), JSON.stringify(cValue));
      });
    } else {
      it('should fail when value is Object', async function() {
        var cKey = 'cache-key-object' + keySuffix,
          cValue = { a: 1 },
          responseSet = await cahceObj.setObject(cKey, cValue),
          response = await cahceObj.get(cKey);
        assert.equal(response.isSuccess(), false);
      });

      it('should fail when value is Array', async function() {
        var cKey = 'cache-key-object' + keySuffix,
          cValue = [1, 2, 3, 4],
          responseSet = await cahceObj.set(cKey, cValue),
          response = await cahceObj.get(cKey);
        assert.equal(response.isSuccess(), false);
      });
    }
  });
}

openSTCache = openSTCacheKlass.getInstance(configStrategy);
cacheImplementer = openSTCache.cacheInstance;

performTest(cacheImplementer, 'ConsistentBehaviour');
performTest(cacheImplementer, 'InconsistentBehaviour');
