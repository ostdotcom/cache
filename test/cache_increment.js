// Load external packages
const chai = require('chai')
  , assert = chai.assert;

// Load cache service
const rootPrefix = ".."
  , openSTCacheKlass = require(rootPrefix + '/services/cache')
  , engineType = process.env.OST_CACHING_ENGINE
;

function performTest (cahceObj, keySuffix) {

  describe('Cache Increment ' + keySuffix, function() {

    keySuffix = keySuffix + "_" + (new Date()).getTime();

    it('should return promise', async function() {
      var cKey = "cache-key-incr-counter" + keySuffix
        , cValue = 1
        , response = cahceObj.increment(cKey, cValue);
      assert.typeOf(response, 'Promise');
    });

    it('should fail when key/value is not passed', async function() {
      var response = await cahceObj.increment();
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key is undefined', async function() {
      var cValue = 1
        , response = await cahceObj.increment(undefined, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key is blank', async function() {
      var cKey = ''
        , cValue = 1
        , response = await cahceObj.increment(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key is number', async function() {
      var cKey = 10
        , cValue = 1
        , response = await cahceObj.increment(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key has space', async function() {
      var cKey = "a b" + keySuffix
        , cValue = 1
        , response = await cahceObj.increment(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key length is > 250 bytes', async function() {
      var cKey = Array(252).join('x')
        , cValue = 1
        , response = await cahceObj.increment(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when value is Object', async function() {
      var cKey = "cache-key-incr-counter" + keySuffix
        , cValue = {a: 1}
        , response = await cahceObj.increment(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when value is blank', async function() {
      var cKey = "cache-key-incr-counter" + keySuffix
        , cValue = ""
        , response = await cahceObj.increment(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when value is string', async function() {
      var cKey = "cache-key-incr-counter" + keySuffix
        , cValue = "String Value"
        , response = await cahceObj.increment(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key has non numeric value', async function() {
      var cKey = "cache-key-incr-non-numeric" + keySuffix
        , cValue = "hi"
        , response = await cahceObj.set(cKey, cValue);
      assert.equal(response.isSuccess(), true);

      cValue = 10
      response = await cahceObj.increment(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    performTestWhenKeyDoesNotExists(cahceObj, keySuffix);

    it('should pass incremented by multiple integer values', async function() {
      var cKey = "cache-key-incr-counter-key" + keySuffix
        , cValue = 10
        , response = await cahceObj.set(cKey, cValue);
      assert.equal(response.isSuccess(), true);

      // increment by default value
      resObj = await cahceObj.increment(cKey);
      assert.equal(resObj.isSuccess(), true);
      cValue += 1;
      assert.equal(resObj.data.response, cValue);

      // increment by negative value
      resObj = await cahceObj.increment(cKey, -1);
      assert.equal(resObj.isSuccess(), false);

      // increment by float value
      resObj = await cahceObj.increment(cKey, 1.2);
      assert.equal(resObj.isSuccess(), false);

      // Increment by 1
      var incrementBy = [1, 3, 2, 10, 100, 57];
      for (var i=0; i < incrementBy.length; i++) {
        resObj = await cahceObj.increment(cKey, incrementBy[i]);
        assert.equal(resObj.isSuccess(), true);
        cValue += incrementBy[i];
        assert.equal(resObj.data.response, cValue);
      }

    });

  });
}

function performTestWhenKeyDoesNotExists(cahceObj, keySuffix) {
  const failCase = function () {
    it('should fail when key does not exist', async function() {
      var cKey = "cache-key-incr-counter-not-exist" + keySuffix
        , cValue = 10
        , response = await cahceObj.increment(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });
  };

  const passCase = function () {
    it('should pass when key does not exist', async function() {
      var cKey = "cache-key-incr-counter-not-exist" + keySuffix
        , cValue = 10
        , response = await cahceObj.increment(cKey, cValue);
      assert.equal(response.isSuccess(), true);
      assert.equal(response.data.response, cValue);
    });
  }

  if (cahceObj._isConsistentBehaviour){
    failCase();
  } else {
    if (engineType == 'redis') {
      passCase();
    } else if(engineType == 'memcached'){
      failCase();
    }	else if (engineType == 'none') {
      passCase();
    }
  }
}

performTest(new openSTCacheKlass(engineType, true), "ConsistentBehaviour");
performTest(new openSTCacheKlass (engineType, false), "InconsistentBehaviour");