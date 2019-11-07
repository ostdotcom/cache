/**
 * Depending on cacheEngine variable, the preferred caching engine is picked. This module acts as a
 * wrapper / factory for the cache layer. Following are the actual implementations of the cache layer methods: <br>
 *     <ul>
 *       <li>Memcached implementation - ref: {@link module:lib/cache/implementer/Memcached}</li>
 *       <li>Redis implementation - ref: {@link module:lib/cache/implementer/Redis}</li>
 *       <li>In Memory implementation - ref: {@link module:lib/cache/implementer/InMemory}</li>
 *     </ul>
 *
 * @module services/CacheInstance
 */

const OSTBase = require('@ostdotcom/base');

const rootPrefix = '..',
  coreConstants = require(rootPrefix + '/config/coreConstant'),
  instanceMap = require(rootPrefix + '/lib/cache/existingInstance');

const InstanceComposer = OSTBase.InstanceComposer;

require(rootPrefix + '/lib/cache/implementer/Redis');
require(rootPrefix + '/lib/cache/implementer/Memcached');
require(rootPrefix + '/lib/cache/implementer/InMemory');

/**
 * Class for cache instance.
 *
 * @class CacheInstance
 */
class CacheInstance {
  /**
   * Constructor for cache instance.
   *
   * @param {object} configStrategy
   * @param {object} configStrategy.cache
   * @param {string} configStrategy.cache.engine
   * @param {string/number} configStrategy.cache.consistentBehavior
   * @param {object} instanceComposer
   *
   * @returns {cacheInstance}
   */
  constructor(configStrategy, instanceComposer) {
    const oThis = this;

    if (configStrategy.cache.engine === undefined) {
      throw new Error('OST_CACHE_ENGINE parameter missing.');
    }

    // Grab the required details from the configStrategy.
    oThis.cacheEngine = configStrategy.cache.engine;
    oThis.isConsistentBehaviour = configStrategy.cache.consistentBehavior;

    // Sanitize the isConsistentBehaviour variable.
    oThis.isConsistentBehaviour = oThis.isConsistentBehaviour == undefined ? true : oThis.isConsistentBehaviour != '0';

    // Stores the endpoint for key generation of instanceMap.
    oThis.endpointDetails = null;

    // Generate endpointDetails for key generation of instanceMap.
    if (oThis.cacheEngine === 'redis') {
      const redisMandatoryParams = ['host', 'port', 'password', 'enableTsl'];

      // Check if all the mandatory connection parameters for Redis are available or not.
      for (let key = 0; key < redisMandatoryParams.length; key++) {
        if (!Object.prototype.hasOwnProperty.call(configStrategy.cache, redisMandatoryParams[key])) {
          throw new Error('Redis one or more mandatory connection parameters missing.');
        }
      }

      oThis.endpointDetails =
        configStrategy.cache.host.toLowerCase() +
        '-' +
        configStrategy.cache.port.toString() +
        '-' +
        configStrategy.cache.enableTsl.toString();
    } else if (oThis.cacheEngine === 'memcached') {
      if (!Object.prototype.hasOwnProperty.call(configStrategy.cache, 'servers')) {
        throw new Error('Memcached mandatory connection parameters missing.');
      }

      oThis.endpointDetails = configStrategy.cache.servers.join(',').toLowerCase();
    } else {
      oThis.endpointDetails = `in-memory-${configStrategy.cache.namespace || ''}`;
    }

    return oThis.getInstance(instanceComposer);
  }

  /**
   * Fetches a cache instance if available in instanceMap. If instance is not available in
   * instanceMap, it calls createCacheInstance() to create a new cache instance.
   *
   * @param {object} instanceComposer
   *
   * @returns {cacheInstance}
   */
  getInstance(instanceComposer) {
    const oThis = this;

    // Fetches the cache instance key to be used.
    const instanceKey = oThis.getMapKey();

    if (Object.prototype.hasOwnProperty.call(instanceMap, instanceKey)) {
      return instanceMap[instanceKey];
    }

    return oThis.createCacheInstance(instanceComposer);
  }

  /**
   * Creates the key for the instanceMap.
   *
   * @returns {string}
   */
  getMapKey() {
    const oThis = this;

    return oThis.cacheEngine.toString() + '-' + oThis.isConsistentBehaviour.toString() + '-' + oThis.endpointDetails;
  }

  /**
   * Creates a new cache instance if not available in instanceMap.
   *
   * @returns {cacheInstance}
   */
  createCacheInstance(instanceComposer) {
    const oThis = this;

    let implementerKlass = null;
    switch (oThis.cacheEngine) {
      case 'redis': {
        implementerKlass = instanceComposer.getShadowedClassFor(coreConstants.icNameSpace, 'RedisCacheImplementer');
        break;
      }
      case 'memcached': {
        implementerKlass = instanceComposer.getShadowedClassFor(coreConstants.icNameSpace, 'MemcachedCacheImplementer');
        break;
      }
      case 'none': {
        implementerKlass = instanceComposer.getShadowedClassFor(coreConstants.icNameSpace, 'InMemoryCacheImplementer');
        break;
      }
      default: {
        throw new Error('invalid caching engine or not defined.');
      }
    }

    const cacheInstance = new implementerKlass(oThis.isConsistentBehaviour);

    // Fetch the instanceKey.
    const instanceKey = oThis.getMapKey();

    // Set the newly created instance in the map.
    instanceMap[instanceKey] = cacheInstance;

    return cacheInstance;
  }
}

InstanceComposer.registerAsObject(CacheInstance, coreConstants.icNameSpace, 'getCacheInstance', true);

module.exports = CacheInstance;
