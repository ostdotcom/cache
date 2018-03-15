// Load external packages
const chai = require('chai')
  , assert = chai.assert;

// Load cache service
const rootPrefix = ".."
  , openSTCacheKlass = require(rootPrefix + '/services/cache')
  , engineType = process.env.OST_CACHING_ENGINE
;

function performTest (cahceObj, keySuffix) {

  describe('Cache SetObject ' + keySuffix, function() {

    keySuffix = keySuffix + "_" + (new Date()).getTime();

    it('should return promise', async function() {
      var cKey = "cache-key-object" + keySuffix
        , cValue = {a: 1}
        , response = cahceObj.setObject(cKey, cValue);
      assert.typeOf(response, 'Promise');
    });

    it('should fail when key/value is not passed', async function() {
      var response = await cahceObj.setObject();
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key is undefined', async function() {
      var cValue = {a: 1}
        , response = await cahceObj.setObject(undefined, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key is blank', async function() {
      var cKey = ''
        , cValue = {a: 1}
        , response = await cahceObj.setObject(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key is number', async function() {
      var cKey = 10
        , cValue = {a: 1}
        , response = await cahceObj.setObject(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key has space', async function() {
      var cKey = "a b" + keySuffix
        , cValue = {a: 1}
        , response = await cahceObj.setObject(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key length is > 250 bytes', async function() {
      var cKey = Array(252).join('x')
        , cValue = {a: 1}
        , response = await cahceObj.setObject(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when value is not Object', async function() {
      var cKey = "cache-key-object" + keySuffix
        , cValue = "cache-value"
        , response = await cahceObj.setObject(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when value is undefined', async function() {
      var cKey = "cache-key-object" + keySuffix
        , response = await cahceObj.setObject(cKey);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when value size is > 1 MB', async function() {
      var cKey = "cache-key-object" + keySuffix
        , cValue = {a: Array(1050000).join('x')}
        , response = await cahceObj.setObject(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when value is string', async function() {
      var cKey = "cache-key-object" + keySuffix
        , cValue = "String Value"
        , response = await cahceObj.setObject(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when value is integer', async function() {
      var cKey = "cache-key-object" + keySuffix
        , cValue = 10
        , response = await cahceObj.setObject(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when value is blank', async function() {
      var cKey = "cache-key-object" + keySuffix
        , cValue = ""
        , response = await cahceObj.setObject(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });

    performTestWhenValueIsArray(cahceObj, keySuffix);

    it('should pass when value is object', async function() {
      var cKey = "cache-key-object" + keySuffix
        , cValue = {a: 'a'}
        , response = await cahceObj.setObject(cKey, cValue);
      assert.equal(response.isSuccess(), true);
      assert.equal(response.data.response, true);
    });

    it('should pass when value is complex object', async function() {
      var cKey = "cache-key-object" + keySuffix
        , cValue = {a: 'a', b: [12,23], c: true, d: 1}
        , response = await cahceObj.setObject(cKey, cValue);
      assert.equal(response.isSuccess(), true);
      assert.equal(response.data.response, true);
    });

    it('should delete from cache after ttl (if cache engine is not redis)', async function() {
      var cKey = "cache-key" + keySuffix
        , cValue = {a: 'a', b: [12,23], c: true, d: 1}
        , ttl = 6 // seconds
        , response = await cahceObj.setObject(cKey, cValue, ttl);
      setTimeout(async function(){
        response = await cahceObj.getObject(cKey);
        assert.equal(response.isSuccess(), true);
        if (engineType != 'redis') {
          assert.equal(response.data.response, null);
        } else {
          assert.equal(response.data.response, true);
        }
      }, ttl * 1000
      );
    });

  });
}


function performTestWhenValueIsArray(cahceObj, keySuffix) {
  const failCase = function () {
    it('should fail when value is Array', async function() {
      var cKey = "cache-key-object" + keySuffix
        , cValue = [12,23]
        , response = await cahceObj.setObject(cKey, cValue);
      assert.equal(response.isSuccess(), false);
    });
  };

  const passCase = function () {
    it('should pass when value is Array', async function() {
      var cKey = "cache-key-object" + keySuffix
        , cValue = [12,23]
        , response = await cahceObj.setObject(cKey, cValue);
      assert.equal(response.isSuccess(), true);

      const getResponse = await cahceObj.getObject(cKey);
      assert.deepEqual(cValue, getResponse.data.response);
    });
  }

  if (cahceObj._isConsistentBehaviour){
    failCase();
  } else {
    if (engineType == 'redis') {
      failCase();
    } else if(engineType == 'memcached'){
      passCase();
    }	else if (engineType == 'none') {
      passCase();
    }
  }
}


performTest(new openSTCacheKlass(engineType, true), "ConsistentBehaviour");
performTest(new openSTCacheKlass (engineType, false), "InconsistentBehaviour");