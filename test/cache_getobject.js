// Load external packages
const chai = require('chai')
  , assert = chai.assert;

// Load cache service
const rootPrefix = ".."
  , openSTCacheKlass = require(rootPrefix + '/services/cache')
  , engineType = process.env.OST_CACHING_ENGINE
;

function performTest (cahceObj, keySuffix) {

  describe('Cache GetObject ' + keySuffix, function() {

    keySuffix = keySuffix + "_" + (new Date()).getTime();

    it('should return promise', async function() {
      var cKey = "cache-key-object" + keySuffix
        , response = cahceObj.getObject(cKey);
      assert.typeOf(response, 'Promise');
    });

    it('should fail when key/value is not passed', async function() {
      var response = await cahceObj.getObject();
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key is undefined', async function() {
      var response = await cahceObj.getObject(undefined);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key is blank', async function() {
      var cKey = ''
        , response = await cahceObj.getObject(cKey);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key is number', async function() {
      var cKey = 10
        , response = await cahceObj.getObject(cKey);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key has space', async function() {
      var cKey = "a b" + keySuffix
        , response = await cahceObj.getObject(cKey);
      assert.equal(response.isSuccess(), false);
    });

    it('should fail when key length is > 250 bytes', async function() {
      var cKey = Array(252).join('x')
        , response = await cahceObj.getObject(cKey);
      assert.equal(response.isSuccess(), false);
    });

    it('should pass when value is not set', async function() {
      var cKey = "cache-key-not-set" + keySuffix
        , response = await cahceObj.getObject(cKey);
      assert.equal(response.isSuccess(), true);
      assert.equal(response.data.response, null);
    });

    it('should pass when value is object', async function() {
      var cKey = "cache-key-object" + keySuffix
        , cValue = {a: 'a'}
        , responseSet = await cahceObj.setObject(cKey, cValue)
        , response = await cahceObj.getObject(cKey);
      assert.equal(response.isSuccess(), true);
      assert.equal(typeof response.data.response, typeof cValue);
      assert.equal(JSON.stringify(response.data.response), JSON.stringify(cValue));
    });

    it('should pass when value is complex object', async function() {
      var cKey = "cache-key-object" + keySuffix
        , cValue = {a: 'a', b: [12,23], c: true, d: 1, e: {f: "hi", g: 1}}
        , responseSet = await cahceObj.setObject(cKey, cValue)
        , response = await cahceObj.getObject(cKey);
      assert.equal(response.isSuccess(), true);
      assert.equal(typeof response.data.response, typeof cValue);
      assert.equal(JSON.stringify(response.data.response), JSON.stringify(cValue));
    });

  });
}

performTest(new openSTCacheKlass(engineType, true), "ConsistentBehaviour");
performTest(new openSTCacheKlass (engineType, false), "InconsistentBehaviour");