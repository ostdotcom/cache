'use strict';

/**
 * Depending on cacheEngine variable, the preferred caching engine is picked. This module acts as a
 * wrapper / factory for the cache layer. Following are the actual implementations of the cache layer methods: <br>
 *     <ul>
 *       <li>Memcached implementation - ref: {@link module:lib/cache/memcached}</li>
 *       <li>Redis implementation - ref: {@link module:lib/cache/redis}</li>
 *       <li>In Memory implementation - ref: {@link module:lib/cache/in_memory}</li>
 *     </ul>
 *
 * @module services/cache_instance
 * @class CacheInstance
 */

const rootPrefix = '..',
  instanceMap = require(rootPrefix + '/lib/cache/existing_instances'),
  OSTBase = require('@openstfoundation/openst-base'),
  coreConstants = require(rootPrefix + '/config/coreConstants');

const InstanceComposer = OSTBase.InstanceComposer;

require(rootPrefix + '/lib/cache/redis');
require(rootPrefix + '/lib/cache/memcached');
require(rootPrefix + '/lib/cache/in_memory');

/**
 * Constructor for Cache Engine
 *
 * @constructor
 *
 */
const CacheInstance = function(configStrategy, instanceComposer) {
  const oThis = this;

  if (configStrategy.cache.engine == undefined) {
    throw 'OST_CACHE_ENGINE parameter missing.';
  }

  // Grab the required details from the configStrategy.
  oThis.cacheEngine = configStrategy.cache.engine;
  oThis.isConsistentBehaviour = configStrategy.cache.consistentBehavior;

  // sanitize the isConsistentBehaviour
  oThis.isConsistentBehaviour = oThis.isConsistentBehaviour == undefined ? true : oThis.isConsistentBehaviour != '0';

  // Stores the endpoint for key generation of instanceMap.
  oThis.endpointDetails = null;

  // Generate endpointDetails for key generation of instanceMap.
  if (oThis.cacheEngine == 'redis') {
    const redisMandatoryParams = ['host', 'port', 'password', 'enableTsl'];

    // Check if all the mandatory connection parameters for Redis are available or not.
    for (let key = 0; key < redisMandatoryParams.length; key++) {
      if (!configStrategy.cache.hasOwnProperty(redisMandatoryParams[key])) {
        throw 'Redis one or more mandatory connection parameters missing.';
      }
    }

    oThis.endpointDetails =
      configStrategy.cache.host.toLowerCase() +
      '-' +
      configStrategy.cache.port.toString() +
      '-' +
      configStrategy.cache.enableTsl.toString();
  } else if (oThis.cacheEngine == 'memcached') {
    if (!configStrategy.cache.hasOwnProperty('servers')) {
      throw 'Memcached mandatory connection parameters missing.';
    }

    oThis.endpointDetails = configStrategy.cache.servers.join(',').toLowerCase();
  } else {
    oThis.endpointDetails = `in-memory-${configStrategy.cache.namespace || ''}`;
  }

  return oThis.getInstance(instanceComposer);
};

CacheInstance.prototype = {
  /**
   * Fetches a cache instance if available in instanceMap. If instance is not available in
   * instanceMap, it calls createCacheInstance() to create a new cache instance.
   *
   * @returns {cacheInstance}
   *
   */
  getInstance: function(instanceComposer) {
    const oThis = this;

    // Fetches the cache instance key to be used.
    let instanceKey = oThis.getMapKey();

    if (instanceMap.hasOwnProperty(instanceKey)) {
      return instanceMap[instanceKey];
    } else {
      return oThis.createCacheInstance(instanceComposer);
    }
  },

  /**
   * Creates the key for the instanceMap.
   *
   * @returns {string}
   *
   */
  getMapKey: function() {
    const oThis = this;

    return oThis.cacheEngine.toString() + '-' + oThis.isConsistentBehaviour.toString() + '-' + oThis.endpointDetails;
  },

  /**
   * Creates a new cache instance if not available in instanceMap.
   *
   * @returns {cacheInstance}
   *
   */
  createCacheInstance: function(instanceComposer) {
    const oThis = this;

    let implementerKlass = null;

    if (oThis.cacheEngine == 'redis') {
      implementerKlass = instanceComposer.getShadowedClassFor(coreConstants.icNameSpace, 'getRedisCacheImplementer');
    } else if (oThis.cacheEngine == 'memcached') {
      implementerKlass = instanceComposer.getShadowedClassFor(
        coreConstants.icNameSpace,
        'getMemcachedCacheImplementer'
      );
    } else if (oThis.cacheEngine == 'none') {
      implementerKlass = instanceComposer.getShadowedClassFor(coreConstants.icNameSpace, 'getInMemoryCacheImplementer');
    } else {
      throw 'invalid caching engine or not defined';
    }

    const cacheInstance = new implementerKlass(oThis.isConsistentBehaviour);

    // Fetch the instanceKey.
    let instanceKey = oThis.getMapKey();

    // Set the newly created instance in the map.
    instanceMap[instanceKey] = cacheInstance;

    return cacheInstance;
  }
};

InstanceComposer.registerAsObject(CacheInstance, coreConstants.icNameSpace, 'getCacheInstance', true);

module.exports = CacheInstance;
