/**
 * Index File for openst-cache
 */

"use strict";

const rootPrefix = "."
  , version = require(rootPrefix + '/package.json').version
  , OpenSTCacheKeys = require(rootPrefix + '/services/openst_cache_keys')
  , InstanceComposer = require(rootPrefix + '/instance_composer')
;

require(rootPrefix + '/services/cache_factory');

const OpenSTCache = function (configStrategy) {
  const oThis = this;

  if (!configStrategy) {
    throw "Mandatory argument configStrategy missing";
  }


  const instanceComposer = new InstanceComposer(configStrategy);
  oThis.ic = function () {
    return instanceComposer;
  };
};

OpenSTCache.prototype = {
  version: version,
  OpenSTCacheKeys: OpenSTCacheKeys
};

Object.defineProperty(OpenSTCache.prototype, "cacheInstance", {
  get: function () {
    const oThis = this;
    return oThis.ic().getCacheInstance();
  }
});

const instanceMap = {};

/**
 * Creates the key for the instanceMap.
 *
 * @returns {string}
 *
 */
const getInstanceKey = function (configStrategy) {

  // Fetch caching ID from the configStrategy.
  return configStrategy.CACHING_STRATEGY_ID;

};


let Factory = function () {};

Factory.prototype = {
  /**
   * Fetches a cache instance if available in instanceMap. If instance is not available in
   * instanceMap, it calls createCacheInstance() to create a new cache instance.
   *
   * @returns {cacheInstance}
   *
   */
  getInstance: function (configStrategy) {
    let instanceKey = getInstanceKey(configStrategy);

    let _instance = instanceMap[instanceKey];

    if (!_instance) {
      _instance = new OpenSTCache(configStrategy);
      instanceMap[instanceKey] = _instance;
    }

    return _instance;
  }
};

const factory = new Factory();
OpenSTCache.getInstance = factory.getInstance;


module.exports = OpenSTCache;