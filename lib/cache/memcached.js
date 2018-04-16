'use strict';
/**
 * Implementation of the caching layer using Memcached.<br><br>
 *
 * @module lib/cache/memcached
 */

// Load external packages
const Memcached = require("memcached");

Object.assign(Memcached.config, {retries: 1, timeout: 500, reconnect: 1000, poolSize: 200});

// Load internal libraries and create instances
const rootPrefix = "../.."
  , cacheConfig = require(rootPrefix + '/config/cache')
  , helper = require(rootPrefix + '/lib/cache/helper')
  , client = new Memcached(cacheConfig.MEMCACHE_SERVERS)
  , defaultLifetime = Number(cacheConfig.DEFAULT_TTL)
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
  , logger = require(rootPrefix + '/lib/logger/custom_console_logger')
;

// Error handling
client.on('issue', function( details ){logger.info("Issue with Memcache server. Trying to resolve!")});
client.on('failure', function( details ){ logger.info( "Server " + details.server + "went down due to: " + details.messages.join( '' ) ) });
client.on('reconnecting', function( details ){ logger.info( "Total downtime caused by server " + details.server + " :" + details.totalDownTime + "ms")});

/**
 * Constructor for memcached implementation
 *
 * @param {boolean} isConsistentBehaviour - specifies if the cache behaviour be consistent accross all cache engines
 *
 * @constructor
 */
const memcachedCache = function (isConsistentBehaviour) {
  const oThis = this;
  oThis._isConsistentBehaviour = isConsistentBehaviour===false ? false : true;
};

memcachedCache.prototype = {

  _isConsistentBehaviour: null,

  /**
   * Get the cached value of a key.
   *
   * @param {string} key - cache key
   *
   * @return {Promise<Result>} - On success, data.value has value. On failure, error details returned.
   */
  get: function (key) {     
    return new Promise(function (onResolve, onReject) {
      // error handling
      if (helper.validateCacheKey(key) === false) {
        return onResolve(responseHelper.error('l_c_m_g_1', 'Cache key validation failed'));
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          onResolve(responseHelper.error('l_c_m_g_2', err));
        } else {
          onResolve(responseHelper.successWithData({response: (data === undefined ? null : data)}));
        }
      };

      // Perform action
      client.get(key, callback);
    });
  },

  /**
   * Get the stored object value for the given key.
   *
   * @param {string} key - cache key
   *
   * @return {Promise<Result>} - On success, data.value has value. On failure, error details returned.
   */
  getObject: function (key) {
    // Perform action
    return this.get(key);
  },

  /**
   * Set a new key value or update the existing key value in cache
   *
   * @param {string} key - cache key
   * @param {mixed} value - data to be cached
   * @param {number} [ttl] - cache expiry in seconds. default: DEFAULT_TTL
   *
   * @return {Promise<Result>} - On success, data.value is true. On failure, error details returned.
   */
  set: function(key, value, ttl) {

    return new Promise(function (onResolve, onReject) {

      // error handling
      if (helper.validateCacheKey(key) === false) {
        return onResolve(responseHelper.error('l_c_m_s_1', 'Cache key validation failed'));
      }
      if (helper.validateCacheValue(value) === false) {
        return onResolve(responseHelper.error('l_c_m_s_2', 'Cache value validation failed'));
      }
      if (helper.validateCacheExpiry(ttl) === false) {
        ttl = defaultLifetime;
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          onResolve(responseHelper.error('l_c_m_s_3', err));
        } else {
          onResolve(responseHelper.successWithData({response: true}));
        }
      };

      // Perform action
      client.set(key, value, ttl, callback);

    });

  },

  /**
   * Cache object in cache
   *
   * @param {string} key - cache key
   * @param {mixed} object - object to be cached
   * @param {number} [ttl] - cache expiry in seconds. default: DEFAULT_TTL
   *
   * @return {Promise<Result>} - On success, data.value is true. On failure, error details returned.
   */
  setObject: function (key, object, ttl) {
    const oThis = this;
    // validate value
    if (typeof object !== 'object') {
      return Promise.resolve(responseHelper.error('l_c_m_so_1', 'Cache value validation failed'));
    }

    // NOTE: To support redis implementation don't allow array
    if (oThis._isConsistentBehaviour && Array.isArray(object)) {
      return Promise.resolve(responseHelper.error('l_c_m_so_2', 'Cache value cannot be array'));
    }

    // Perform action
    return this.set(key, object, ttl);
  },

  /**
   * Delete the key from cache
   *
   * @param {string} key - cache key
   *
   * @return {Promise<Result>} - On success, data.value is true. On failure, error details returned.
   */
  del: function(key) {
    return new Promise(function (onResolve, onReject) {
      // error handling
      if (helper.validateCacheKey(key) === false) {
        return onResolve(responseHelper.error('l_c_m_d_1', 'Cache key validation failed'));
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          onResolve(responseHelper.error('l_c_m_d_2', err));
        } else {
          onResolve(responseHelper.successWithData({response: true}));
        }
      };

      // Perform action
      client.del(key, callback);
    });
  },

  /**
   * Get the values of specified keys.
   *
   * @param {array} keys - cache keys
   *
   * @return {Promise<Result>} - On success, data.value is object of keys and values. On failure, error details returned.
   */
  multiGet: function(keys) {
    return new Promise(function (onResolve, onReject) {
      // error handling
      if(!Array.isArray(keys) || keys.length==0) {
        return onResolve(responseHelper.error('l_c_m_mg_1', 'Cache keys should be an array'));
      }
      for (var i = 0; i < keys.length; i++) {
        if (helper.validateCacheKey(keys[i]) === false) {
          return onResolve(responseHelper.error('l_c_m_mg_2', 'Cache key('+keys[i]+') validation failed'));
        }
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          onResolve(responseHelper.error('l_c_m_g_2', err));
        } else {
          // match behaviour with redis
          for (var i = 0; i < keys.length; i++) {
            data[keys[i]] = (typeof data[keys[i]] === 'object' || data[keys[i]] === undefined) ? null : data[keys[i]];
          }
          onResolve(responseHelper.successWithData({response: data}));
        }
      };

      // Perform action
      client.getMulti(keys, callback);
    });
  },

  /**
   * Increment the numeric value for the given key, if key already exists.
   *
   * @param {string} key - cache key
   * @param {integer} byValue - number by which cache need to be incremented. Default: 1
   *
   * @return {Promise<Result>} - On success, data.value is true. On failure, error details returned.
   */
  increment: function(key, byValue) {
    const oThis = this;
    byValue = byValue===undefined ? 1 : byValue;

    return new Promise(function (onResolve, onReject) {
      // validate key and value
      if (helper.validateCacheKey(key) === false) {
        return onResolve(responseHelper.error('l_c_m_i_1', 'Cache key validation failed'));
      }
      if (byValue !== parseInt(byValue, 10) || byValue < 1 || helper.validateCacheValue(byValue) === false) {
        return onResolve(responseHelper.error('l_c_m_i_2', 'Cache value is not an integer'));
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          onResolve(responseHelper.error('l_c_m_i_3', err));
        } else {
          if (data===false) {
            onResolve(responseHelper.error('l_c_m_i_4', 'Cache key does not exist'));
          } else {
            onResolve(responseHelper.successWithData({response: data}));
          }
        }
      };

      // Perform action
      client.incr(key, byValue, callback);

    });
  },

  /**
   * Change the expiry time of an existing cache key
   *
   * @param {string} key - cache key
   * @param {integer} lifetime - new cache expiry in number of seconds
   *
   * @return {Promise<Result>} - On success, data.value is true. On failure, error details returned.
   */
  touch: function (key, lifetime) {
    const oThis = this;
    return new Promise(function (onResolve, onReject) {
      // validate key and value
      if (helper.validateCacheKey(key) === false) {
        return onResolve(responseHelper.error('l_c_m_t_1', 'Cache key validation failed'));
      }
      if (lifetime !== parseInt(lifetime, 10) || lifetime < 0 || helper.validateCacheValue(lifetime) === false) {
        return onResolve(responseHelper.error('l_c_m_t_2', 'Cache expiry is not a valid number'));
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          onResolve(responseHelper.error('l_c_m_t_3', err));
        } else {
          if (data===false) {
            onResolve(responseHelper.error('l_c_m_t_4', 'Cache key does not exist'));
          } else {
            onResolve(responseHelper.successWithData({response: data}));
          }
        }
      };

      // NOTE: To support redis implementation
      lifetime = (lifetime==0 && oThis._isConsistentBehaviour) ? -1 : lifetime;

      // Perform action
      client.touch(key, lifetime, callback);

    });
  },

  /**
   * Decrement the numeric value for the given key, if key already exists.
   *
   * @param {string} key - cache key
   * @param {integer} byValue - number by which cache need to be decremented. Default: 1
   *
   * @return {Promise<Result>} - On success, data.value is true. On failure, error details returned.
   */
  decrement: function(key, byValue) {
    const oThis = this;
    byValue = byValue===undefined ? 1 : byValue;

    return new Promise(function (onResolve, onReject) {
      // validate key and value
      if (helper.validateCacheKey(key) === false) {
        return onResolve(responseHelper.error('l_c_m_d_1', 'Cache key validation failed'));
      }
      if (byValue !== parseInt(byValue, 10) || byValue < 1 || helper.validateCacheValue(byValue) === false) {
        return onResolve(responseHelper.error('l_c_m_d_2', 'Cache value is not an integer'));
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          onResolve(responseHelper.error('l_c_m_d_3', err));
        } else {
          if (data===false) {
            onResolve(responseHelper.error('l_c_m_d_4', 'Cache key does not exist'));
          } else {
            onResolve(responseHelper.successWithData({response: data}));
          }
        }
      };

      // Perform action
      client.decr(key, byValue, callback);

    });
  },

  /**
   * Delete all keys from cache
   *
   * @return {Promise<Result>}
   */
  delAll: function() {
    const oThis = this;
    return new Promise(function (onResolve, onReject) {
      client.flush(function (err, succeeded) {
        if (err) {
          onResolve(responseHelper.error('l_c_r_t_5', err));
        } else {
          onResolve(responseHelper.successWithData());
        }
      });
    })
  }

};

module.exports = memcachedCache;
