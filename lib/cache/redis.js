'use strict';
/**
 * Implementation of the caching layer using Redis.
 * A persistent Redis connection per Node js worker is maintained and this connection is singleton.<br><br>
 *
 * @module lib/cache/redis
 */
// Load External packages
const redis = require("redis");

// Load internal libraries
const rootPrefix = "../.."
  , cacheConfig = require(rootPrefix + '/config/cache')
  , helper = require(rootPrefix + '/lib/cache/helper')
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
;

// Create connections
const clientOptions = {
  host: cacheConfig.REDIS_HOST,
  port: cacheConfig.REDIS_PORT,
  password: cacheConfig.REDIS_PASS,
  tls: cacheConfig.REDIS_TLS_ENABLED
}
  , client = redis.createClient(clientOptions)
  , defaultLifetime = Number(cacheConfig.DEFAULT_TTL);

/**
 * Constructor for redis implementation
 *
 * @constructor
 */
const redisCache = function () {
};

redisCache.prototype = {

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
        return onResolve(responseHelper.error('l_c_r_g_1', 'Cache key validation failed'));
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          onResolve(responseHelper.error('l_c_r_g_2', err));
        } else {
          onResolve(responseHelper.successWithData({response: data}));
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
    return new Promise(function (onResolve, onReject) {
      // error handling
      if (helper.validateCacheKey(key) === false) {
        return onResolve(responseHelper.error('l_c_r_go_1', 'Cache key validation failed'));
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          onResolve(responseHelper.error('l_c_r_go_2', err));
        } else {
          // format data
          for (var i in data) {
            data[i] = JSON.parse(data[i]);
          };
          onResolve(responseHelper.successWithData({response: data}));
        }
      };

      // Perform action
      client.hgetall(key, callback);
    });
  },

  /**
   * Set a new key value or update the existing key value in cache
   *
   * @param {string} key - cache key
   * @param {mixed} value - data to be cached
   * @param {Number} ttl - cache expiry in seconds (optional)
   *
   * @return {Promise<Result>} - On success, data.value is true. On failure, error details returned.
   */
  set: function (key, value, ttl) {

    return new Promise(function (onResolve, onReject) {

      // error handling
      if (helper.validateCacheKey(key) === false) {
        return onResolve(responseHelper.error('l_c_r_s_1', 'Cache key validation failed'));
      }
      if ((typeof value === 'object') || helper.validateCacheValue(value) === false) {
        return onResolve(responseHelper.error('l_c_r_s_2', 'Cache value validation failed'));
      }
      if (helper.validateCacheExpiry(ttl) === false) {
        ttl = defaultLifetime;
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          onResolve(responseHelper.error('l_c_r_s_3', err));
        } else {
          onResolve(responseHelper.successWithData({response: true}));
        }
      };

      // Perform action
      client.set(key, value, 'EX', ttl, callback);

    });

  },

  /**
   * Cache object in cache
   *
   * @param {string} key - cache key
   * @param {mixed} object - object to be cached
   * @param {Number} ttl - cache expiry in seconds (optional)
   *
   * @return {Promise<Result>} - On success, data.value is true. On failure, error details returned.
   */
  setObject: function (key, object, ttl) {

    var oThis = this;

    return new Promise(async function (onResolve, onReject) {

      // error handling
      if (helper.validateCacheKey(key) === false) {
        return onResolve(responseHelper.error('l_c_r_so_1', 'Cache key validation failed'));
      }
      if ((typeof object !== 'object') || (Array.isArray(object)) || helper.validateCacheValue(object) === false) {
        return onResolve(responseHelper.error('l_c_r_so_2', 'Cache value validation failed'));
      }
      if (helper.validateCacheExpiry(ttl) === false) {
        ttl = defaultLifetime;
      }

      //NOTE: hmset is always merge the value of the object, never overwrite key. So, delete before set.
      await oThis.del(key);

      // Set callback method
      var callback = function (err, res) {
        if (err) {
          onResolve(responseHelper.error('l_c_r_so_3', err));
        } else {
          onResolve(responseHelper.successWithData({response: true}));
        }
      };

      // format data
      var arrayRepresentation = [];
      for (var i in object) {
        arrayRepresentation.push(i);
        arrayRepresentation.push(JSON.stringify(object[i]));
      };

      // Perform action
      // TODO: redis hmset does not support custom TTl as of now handle it when it does.
      client.hmset(key, arrayRepresentation, callback);

    });

  },

  /**
   * Delete the key from cache
   *
   * @param {string} key - cache key
   *
   * @return {Promise<Result>} - On success, data.value is true. On failure, error details returned.
   */
  del: function (key) {
    return new Promise(function (onResolve, onReject) {
      // error handling
      if (helper.validateCacheKey(key) === false) {
        return onResolve(responseHelper.error('l_c_r_d_1', 'Cache key validation failed'));
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          onResolve(responseHelper.error('l_c_r_d_2', err));
        } else {
          onResolve(responseHelper.successWithData({response: true}));
        }
      };

      // Perform action
      client.del(key, callback);
    });
  },

  /**
   * Get the values of specified keys.<br><br>
   * <b>NOTE: Object cache retrieval is not support with multiGet. It returns null value, even if value is set in cache.</b>
   *
   * @param {array} keys - cache keys
   *
   * @return {Promise<Result>} - On success, data.value is object of keys and values. On failure, error details returned.
   */
  multiGet: function (keys) {
    return new Promise(function (onResolve, onReject) {
      // error handling
      if(!Array.isArray(keys) || keys.length==0) {
        return onResolve(responseHelper.error('l_c_r_mg_1', 'Cache keys should be an array'));
      }
      for (var i = 0; i < keys.length; i++) {
        if (helper.validateCacheKey(keys[i]) === false) {
          return onResolve(responseHelper.error('l_c_r_mg_2', 'Cache key validation failed'));
        }
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          onResolve(responseHelper.error('l_c_r_mg_3', err));
        } else {
          var retVal = {};
          for (var i = 0; i < keys.length; i++) {
            retVal[keys[i]] = data[i];
          }
          onResolve(responseHelper.successWithData({response: retVal}));
        }
      };

      // Perform action
      client.mget(keys, callback);
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
  increment: function (key, byValue) {
    const oThis = this;
    byValue = byValue===undefined ? 1 : byValue;

    return new Promise(function (onResolve, onReject) {
      // validate key and value
      if (helper.validateCacheKey(key) === false) {
        return onResolve(responseHelper.error('l_c_r_i_1', 'Cache key validation failed'));
      }
      if (byValue !== parseInt(byValue, 10) || byValue < 1 || helper.validateCacheValue(byValue) === false) {
        return onResolve(responseHelper.error('l_c_r_i_2', 'Cache value is not integer'));
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          onResolve(responseHelper.error('l_c_r_i_3', err));
        } else {
          if (data===false) {
            onResolve(responseHelper.error('l_c_r_i_4', 'Cache Key does not exists'));
          } else {
            onResolve(responseHelper.successWithData({response: data}));
          }
        }
      };

      // callback
      var incrementValue = function (result) {
        if (result.isSuccess() && result.data.response > 0) {
          client.incrby(key, byValue, callback);
        } else {
          onResolve(responseHelper.error('l_c_m_i_5', 'Cache Key does not exists'));
        }
      };

      // NOTE: To support memcached implementation
      oThis.get(key).then(incrementValue);

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
  decrement: function (key, byValue) {
    const oThis = this;
    byValue = byValue===undefined ? 1 : byValue;

    return new Promise(function (onResolve, onReject) {
      // validate key and value
      if (helper.validateCacheKey(key) === false) {
        return onResolve(responseHelper.error('l_c_r_d_1', 'Cache key validation failed'));
      }
      if (byValue !== parseInt(byValue, 10) || byValue < 1 || helper.validateCacheValue(byValue) === false) {
        return onResolve(responseHelper.error('l_c_r_d_2', 'Cache value is not integer'));
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          onResolve(responseHelper.error('l_c_r_d_3', err));
        } else {
          if (data===false) {
            onResolve(responseHelper.error('l_c_r_d_4', 'Cache Key does not exists'));
          } else {
            onResolve(responseHelper.successWithData({response: data}));
          }
        }
      };

      // Perform action
      var decrementValue = function (result) {
        if (result.isSuccess() && result.data.response > 0) {
          // NOTE: To support memcached implementation
          byValue = (result.data.response < byValue) ? result.data.response : byValue;
          // decrement
          client.decrby(key, byValue, callback);
        } else {
          onResolve(responseHelper.error('l_c_m_d_5', 'Cache Key does not exists'));
        }
      };

      // NOTE: To support memcached implementation
      oThis.get(key).then(decrementValue);

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
        return onResolve(responseHelper.error('l_c_r_t_1', 'Cache key validation failed'));
      }
      if (lifetime !== parseInt(lifetime, 10) || lifetime < 0 || helper.validateCacheValue(lifetime) === false) {
        return onResolve(responseHelper.error('l_c_r_t_2', 'Cache expiry is not valid number'));
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          onResolve(responseHelper.error('l_c_r_t_3', err));
        } else {
          if (data===0) {
            onResolve(responseHelper.error('l_c_r_t_4', 'Cache Key does not exists'));
          } else {
            onResolve(responseHelper.successWithData({response: data}));
          }
        }
      };

      // Perform action
      client.expire(key, lifetime, callback);

    });
  }
};

module.exports = new redisCache();