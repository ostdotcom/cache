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
 * @class Cache
 * @constructor
 *
 */

const rootPrefix = ".."
  , cacheConfig = require(rootPrefix + '/config/cache');


/**
 * Constructor for Cache Engine
 *
 * @param {string} cacheEngine - Specify the cache engine. Possible values: 'redis', 'memcached', 'none'
 * @param {boolean} isConsistentBehaviour - Specify if the cache behaviour need to be consistent across all the engines or not. Default is: True
 *
 * @constructor
 */
const Cache = function (cacheEngine, isConsistentBehaviour) {

  const oThis = this;

  var implementerKlass = null;

  if (cacheEngine == 'redis') {
    implementerKlass = require(rootPrefix + '/lib/cache/redis');
  } else if(cacheEngine == 'memcached'){
    implementerKlass = require(rootPrefix + '/lib/cache/memcached');
  }	else if (cacheEngine == 'none') {
    implementerKlass = require(rootPrefix + '/lib/cache/in_memory');
  } else {
    throw('invalid caching engine or not defined');
  }

  return new implementerKlass((isConsistentBehaviour == undefined) ? true: isConsistentBehaviour);
};

Cache.prototype = {
};

module.exports = Cache;
