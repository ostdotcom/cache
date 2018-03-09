// Load external packages
const chai = require('chai')
  , assert = chai.assert;

// Load cache service
const rootPrefix = ".."
  , openSTCacheKlass = require(rootPrefix + '/services/cache')
  , engineType = process.env.OST_CACHING_ENGINE
;

function performTest (cahceObj, keySuffix) {

  describe('Cache Touch '+ keySuffix, function() {

    keySuffix = keySuffix + "_" + (new Date()).getTime();

    it('should return promise', async function() {
      var cKey = "cache-key-touch" + keySuffix
        , cValue = 100
        , response = cahceObj.touch(cKey, cValue);
      assert.typeOf(response, 'Promise');
    });

    it('should fail when key/expiry is not passed', async function() {
      var response = await cahceObj.touch();
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key is undefined', async function() {
      var cValue = 100
        , response = await cahceObj.touch(undefined, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key is blank', async function() {
      var cKey = ''
        , cValue = 100
        , response = await cahceObj.touch(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key is number', async function() {
      var cKey = 10
        , cValue = 100
        , response = await cahceObj.touch(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key has space', async function() {
      var cKey = "a b" + keySuffix
        , cValue = 100
        , response = await cahceObj.touch(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key length is > 250 bytes', async function() {
      var cKey = Array(252).join('x')
        , cValue = 100
        , response = await cahceObj.touch(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when expiry is Object', async function() {
      var cKey = "cache-key-touch" + keySuffix
        , cValue = {a: 1}
        , response = await cahceObj.touch(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when expiry is blank', async function() {
      var cKey = "cache-key-touch" + keySuffix
        , cValue = ""
        , response = await cahceObj.touch(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when expiry is string', async function() {
      var cKey = "cache-key-touch" + keySuffix
        , cValue = "String Value"
        , response = await cahceObj.touch(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key does not exist', async function() {
      var cKey = "cache-key-touch-not-exist" + keySuffix
        , cValue = 100
        , response = await cahceObj.touch(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when expiry is negative secs', async function() {
      var cKey = "cache-key-touch" + keySuffix
        , cValue = "my value"
        , response = await cahceObj.set(cKey, cValue);
      assert.equal(response.isSuccess(), true);

      // touch by negative value
      expiry = -1;
      resObj = await cahceObj.touch(cKey, expiry);
      assert.equal(resObj.isSuccess(), false);
    });

    it('should pass when expiry is 100 secs', async function() {
      var cKey = "cache-key-touch" + keySuffix
        , cValue = "my value"
        , response = await cahceObj.set(cKey, cValue);
      assert.equal(response.isSuccess(), true);

      // touch by positive value
      expiry = 100;
      resObj = await cahceObj.touch(cKey, expiry);
      assert.equal(resObj.isSuccess(), true);
    });

    it('should pass when expiry is 0 secs', async function() {
      var cKey = "cache-key-touch" + keySuffix
        , cValue = "my value"
        , response = await cahceObj.set(cKey, cValue);
      assert.equal(response.isSuccess(), true);

      // touch by 0 value
      expiry = 0;
      resObj = await cahceObj.touch(cKey, expiry);
      assert.equal(resObj.isSuccess(), true);

      // check if key deleted
      resObj = await cahceObj.get(cKey);
      assert.equal(resObj.isSuccess(), true);

      if (cahceObj._isConsistentBehaviour) {
        assert.equal(resObj.data.response, null);
      } else {
        if (engineType == 'memcached') {
          assert.equal(resObj.data.response, cValue);
        } else {
          assert.equal(resObj.data.response, null);
        }
      }


    });

  });

}

performTest(new openSTCacheKlass(engineType, true), "ConsistentBehaviour");
performTest(new openSTCacheKlass (engineType, false), "InconsistentBehaviour");