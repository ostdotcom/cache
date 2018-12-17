'use strict';

/*
 * Cache Related Constants:
 *
 * Load caching layer related constant variables from environment variables
 *
 * @module config/cache
 */

// Load internal libraries
const rootPrefix = '..',
  OSTBase = require('@openstfoundation/openst-base'),
  coreConstants = require(rootPrefix + '/config/coreConstants');

const InstanceComposer = OSTBase.InstanceComposer;

class GetCacheConfigHelper {

  constructor(configStrategy, instanceComposer) {
    const oThis = this;

    oThis.DEFAULT_TTL = configStrategy.cache.defaultTtl;
    oThis.REDIS_HOST = configStrategy.cache.host;
    oThis.REDIS_PORT = configStrategy.cache.port;
    oThis.REDIS_PASS = configStrategy.cache.password;
    oThis.REDIS_TLS_ENABLED = configStrategy.cache.enableTsl == '1';
    oThis.DEBUG_ENABLED = configStrategy.DEBUG_ENABLED;
    oThis.MEMCACHE_SERVERS = (configStrategy.cache.servers || [])
      .map(Function.prototype.call, String.prototype.trim);

    oThis.INMEMORY_CACHE_NAMESPACE = configStrategy.cache.namespace || '';
  }

}

InstanceComposer.registerAsObject(GetCacheConfigHelper, coreConstants.icNameSpace, 'getCacheConfigHelper', true);

module.exports = GetCacheConfigHelper;
