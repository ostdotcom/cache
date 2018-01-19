'use strict';

/**
 * Depending on CACHING_ENGINE environment variable, the preferred caching engine is picked. This module acts as a
 * wrapper / factory for the cache layer. Following are the actual implementations of the cache layer methods: <br>
 *     <ul>
 *       <li>Memcached implementation - ref: {@link module:lib/cache/memcached}</li>
 *       <li>Redis implementation - ref: {@link module:lib/cache/redis}</li>
 *       <li>In Memory implementation - ref: {@link module:lib/cache/in_memory}</li>
 *     </ul>
 *
 * @class Cache
 * @constructor
 *
 */
const Cache = module.exports = function () {};

const rootPrefix = ".."
  , cacheConfig = require(rootPrefix + '/config/cache');

var implementer = null;

if (cacheConfig.CACHING_ENGINE == 'redis') {
  implementer = require(rootPrefix + '/lib/cache/redis');
} else if(cacheConfig.CACHING_ENGINE == 'memcached'){
  implementer = require(rootPrefix + '/lib/cache/memcached');
}	else if (cacheConfig.CACHING_ENGINE == 'none') {
  implementer = require(rootPrefix + '/lib/cache/in_memory');
} else {
  throw('invalid CACHING_ENGINE');
}

Cache.prototype = {
  implementer: implementer
};
