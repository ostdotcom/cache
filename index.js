/**
 * Index File for openst-cache
 */

'use strict';

const rootPrefix = '.',
  version = require(rootPrefix + '/package.json').version,
  OpenSTCacheKeys = require(rootPrefix + '/services/openst_cache_keys'),
  InstanceComposer = require(rootPrefix + '/instance_composer');

require(rootPrefix + '/services/cache_instance');

const OpenSTCache = function(configStrategy) {
  const oThis = this;

  if (!configStrategy) {
    throw 'Mandatory argument configStrategy missing';
  }

  const instanceComposer = new InstanceComposer(configStrategy);
  oThis.ic = function() {
    return instanceComposer;
  };
};

OpenSTCache.prototype = {
  version: version,
  OpenSTCacheKeys: OpenSTCacheKeys
};

Object.defineProperty(OpenSTCache.prototype, 'cacheInstance', {
  get: function() {
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
const getInstanceKey = function(configStrategy) {
  if (configStrategy.OST_CACHING_ENGINE == undefined) {
    throw 'OST_CACHE_ENGINE parameter missing.';
  }

  // Grab the required details from the configStrategy.
  const cacheEngine = configStrategy.OST_CACHING_ENGINE.toString();
  let isConsistentBehaviour = configStrategy.OST_CACHE_CONSISTENT_BEHAVIOR;

  // Sanitize isConsistentBehaviour
  isConsistentBehaviour = isConsistentBehaviour == undefined ? true : isConsistentBehaviour != '0';

  // Stores the endpoint for key generation of instanceMap.
  let endpointDetails = null;

  // Generate endpointDetails for key generation of instanceMap.
  if (cacheEngine == 'redis') {
    const redisMandatoryParams = ['OST_REDIS_HOST', 'OST_REDIS_PORT', 'OST_REDIS_PASS', 'OST_REDIS_TLS_ENABLED'];

    // Check if all the mandatory connection parameters for Redis are available or not.
    for (let key = 0; key < redisMandatoryParams.length; key++) {
      if (!configStrategy.hasOwnProperty(redisMandatoryParams[key])) {
        throw 'Redis - mandatory connection parameters missing.';
      }
    }

    endpointDetails =
      configStrategy.OST_REDIS_HOST.toLowerCase() +
      '-' +
      configStrategy.OST_REDIS_PORT.toString() +
      '-' +
      configStrategy.OST_REDIS_TLS_ENABLED.toString();
  } else if (cacheEngine == 'memcached') {
    if (!configStrategy.hasOwnProperty('OST_MEMCACHE_SERVERS')) {
      throw 'Memcached - mandatory connection parameters missing.';
    }

    endpointDetails = configStrategy.OST_MEMCACHE_SERVERS.toLowerCase();
  } else {
    endpointDetails = configStrategy.OST_INMEMORY_CACHE_NAMESPACE || '';
  }

  return cacheEngine + '-' + isConsistentBehaviour.toString() + '-' + endpointDetails;
};

let Factory = function() {};

Factory.prototype = {
  /**
   * Fetches a cache instance if available in instanceMap. If instance is not available in
   * instanceMap, it calls createCacheInstance() to create a new cache instance.
   *
   * @returns {cacheInstance}
   *
   */
  getInstance: function(configStrategy) {
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
OpenSTCache.getInstance = function() {
  return factory.getInstance.apply(factory, arguments);
};

module.exports = OpenSTCache;
