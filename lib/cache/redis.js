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
 * @param {boolean} isConsistentBehaviour - specifies if the cache behaviour be consistent accross all cache engines
 *
 * @constructor
 */
const redisCache = function (isConsistentBehaviour) {
  const oThis = this;
  oThis._isConsistentBehaviour = isConsistentBehaviour===false ? false : true;
};

redisCache.prototype = {

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
        let errObj = responseHelper.error({
          internal_error_identifier: 'l_c_r_g_1',
          api_error_identifier: 'invalid_cache_key',
          error_config: helper.fetchErrorConfig(),
          debug_options: {key: key}
        });
        return onResolve(errObj);
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          let errObj = responseHelper.error({
            internal_error_identifier: 'l_c_r_g_2',
            api_error_identifier: 'something_went_wrong',
            error_config: helper.fetchErrorConfig(),
            debug_options: {err: err}
          });
          return onResolve(errObj);
        } else {
          return onResolve(responseHelper.successWithData({response: data}));
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
        let errObj = responseHelper.error({
          internal_error_identifier: 'l_c_r_go_1',
          api_error_identifier: 'invalid_cache_key',
          error_config: helper.fetchErrorConfig(),
          debug_options: {key: key}
        });
        return onResolve(errObj);
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          let errObj = responseHelper.error({
            internal_error_identifier: 'l_c_r_go_2',
            api_error_identifier: 'something_went_wrong',
            error_config: helper.fetchErrorConfig(),
            debug_options: {err: err}
          });
          return onResolve(errObj);
        } else {
          // format data
          for (var i in data) {
            data[i] = JSON.parse(data[i]);
          }
          return onResolve(responseHelper.successWithData({response: data}));
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
   * @param {number} [ttl] - cache expiry in seconds. default: DEFAULT_TTL
   *
   * @return {Promise<Result>} - On success, data.value is true. On failure, error details returned.
   */
  set: function (key, value, ttl) {

    return new Promise(function (onResolve, onReject) {

      // error handling
      if (helper.validateCacheKey(key) === false) {
        let errObj = responseHelper.error({
          internal_error_identifier: 'l_c_r_s_1',
          api_error_identifier: 'invalid_cache_key',
          error_config: helper.fetchErrorConfig(),
          debug_options: {key: key}
        });
        return onResolve(errObj);
      }
      if ((typeof value === 'object') || helper.validateCacheValue(value) === false) {
        let errObj = responseHelper.error({
          internal_error_identifier: 'l_c_r_s_2',
          api_error_identifier: 'invalid_cache_value',
          error_config: helper.fetchErrorConfig(),
          debug_options: {key: key}
        });
        return onResolve(errObj);
      }
      if (helper.validateCacheExpiry(ttl) === false) {
        ttl = defaultLifetime;
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          let errObj = responseHelper.error({
            internal_error_identifier: 'l_c_r_s_3',
            api_error_identifier: 'something_went_wrong',
            error_config: helper.fetchErrorConfig(),
            debug_options: {err: err}
          });
          return onResolve(errObj);
        } else {
          return onResolve(responseHelper.successWithData({response: true}));
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
   *
   * @return {Promise<Result>} - On success, data.value is true. On failure, error details returned.
   */
  setObject: function (key, object) {
    var oThis = this;
    return new Promise(async function (onResolve, onReject) {
      // error handling
      if (helper.validateCacheKey(key) === false) {
        let errObj = responseHelper.error({
          internal_error_identifier: 'l_c_r_so_1',
          api_error_identifier: 'invalid_cache_key',
          error_config: helper.fetchErrorConfig(),
          debug_options: {key: key}
        });
        return onResolve(errObj);
      }
      if ((typeof object !== 'object') || (Array.isArray(object)) || helper.validateCacheValue(object) === false) {
        let errObj = responseHelper.error({
          internal_error_identifier: 'l_c_r_so_2',
          api_error_identifier: 'invalid_cache_value',
          error_config: helper.fetchErrorConfig(),
          debug_options: {object: object}
        });
        return onResolve(errObj);
      }

      //NOTE: hmset is always merge the value of the object, never overwrite key. So, delete before set.
      await oThis.del(key);

      // Set callback method
      var callback = function (err, res) {
        if (err) {
          let errObj = responseHelper.error({
            internal_error_identifier: 'l_c_r_so_3',
            api_error_identifier: 'something_went_wrong',
            error_config: helper.fetchErrorConfig(),
            debug_options: {err: err}
          });
          return onResolve(errObj);
        } else {
          return onResolve(responseHelper.successWithData({response: true}));
        }
      };

      // format data
      var arrayRepresentation = [];
      for (var i in object) {
        arrayRepresentation.push(i);
        arrayRepresentation.push(JSON.stringify(object[i]));
      };

      // Perform action
      // NOTE: redis hmset does not support custom TTl as of now handle it when it does.
      client.hmset(key, arrayRepresentation, callback);

    });

  },

  /**
   * Delete the key from cache
   *
   * @param {string} key - cache key
   *
   * @return {Promise<result>} - On success, data.value is true. On failure, error details returned.
   */
  del: function (key) {
    return new Promise(function (onResolve, onReject) {
      // error handling
      if (helper.validateCacheKey(key) === false) {
        let errObj = responseHelper.error({
          internal_error_identifier: 'l_c_r_d_1',
          api_error_identifier: 'invalid_cache_key',
          error_config: helper.fetchErrorConfig(),
          debug_options: {key: key}
        });
        return onResolve(errObj);
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          let errObj = responseHelper.error({
            internal_error_identifier: 'l_c_r_d_2',
            api_error_identifier: 'something_went_wrong',
            error_config: helper.fetchErrorConfig(),
            debug_options: {err: err}
          });
          return onResolve(errObj);
        } else {
          return onResolve(responseHelper.successWithData({response: true}));
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
        let errObj = responseHelper.error({
          internal_error_identifier: 'l_c_r_mg_1',
          api_error_identifier: 'array_is_invalid_cache_value',
          error_config: helper.fetchErrorConfig(),
          debug_options: {}
        });
        return onResolve(errObj);
      }
      for (var i = 0; i < keys.length; i++) {
        if (helper.validateCacheKey(keys[i]) === false) {
          let errObj = responseHelper.error({
            internal_error_identifier: 'l_c_r_mg_2',
            api_error_identifier: 'invalid_cache_key',
            error_config: helper.fetchErrorConfig(),
            debug_options: {key: keys[i]}
          });
          return onResolve(errObj);
        }
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          let errObj = responseHelper.error({
            internal_error_identifier: 'l_c_r_mg_3',
            api_error_identifier: 'something_went_wrong',
            error_config: helper.fetchErrorConfig(),
            debug_options: {err: err}
          });
          return onResolve(errObj);
        } else {
          var retVal = {};
          for (var i = 0; i < keys.length; i++) {
            retVal[keys[i]] = data[i];
          }
          return onResolve(responseHelper.successWithData({response: retVal}));
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
        let errObj = responseHelper.error({
          internal_error_identifier: 'l_c_r_i_1',
          api_error_identifier: 'invalid_cache_key',
          error_config: helper.fetchErrorConfig(),
          debug_options: {key: key}
        });
        return onResolve(errObj);
      }
      if (byValue !== parseInt(byValue, 10) || byValue < 1 || helper.validateCacheValue(byValue) === false) {
        let errObj = responseHelper.error({
          internal_error_identifier: 'l_c_r_i_2',
          api_error_identifier: 'non_int_cache_value',
          error_config: helper.fetchErrorConfig(),
          debug_options: {byValue: byValue}
        });
        return onResolve(errObj);
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          let errObj = responseHelper.error({
            internal_error_identifier: 'l_c_r_i_3',
            api_error_identifier: 'something_went_wrong',
            error_config: helper.fetchErrorConfig(),
            debug_options: {err: err}
          });
          return onResolve(errObj);
        } else {
          if (data===false) {
            let errObj = responseHelper.error({
              internal_error_identifier: 'l_c_r_i_4',
              api_error_identifier: 'missing_cache_key',
              error_config: helper.fetchErrorConfig(),
              debug_options: {}
            });
            return onResolve(errObj);
          } else {
            return onResolve(responseHelper.successWithData({response: data}));
          }
        }
      };

      if (oThis._isConsistentBehaviour) {
        // Perform action
        var incrementValue = function (result) {
          if (result.isSuccess() && result.data.response > 0) {
            client.incrby(key, byValue, callback);
          } else {
            let errObj = responseHelper.error({
              internal_error_identifier: 'l_c_m_i_5',
              api_error_identifier: 'missing_cache_key',
              error_config: helper.fetchErrorConfig(),
              debug_options: {}
            });
            return onResolve(errObj);
          }
        };

        // NOTE: To support memcached implementation
        oThis.get(key).then(incrementValue);

      } else {
        client.incrby(key, byValue, callback);
      }
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
        let errObj = responseHelper.error({
          internal_error_identifier: 'l_c_r_d_1',
          api_error_identifier: 'invalid_cache_key',
          error_config: helper.fetchErrorConfig(),
          debug_options: {key: key}
        });
        return onResolve(errObj);
      }
      if (byValue !== parseInt(byValue, 10) || byValue < 1 || helper.validateCacheValue(byValue) === false) {
        let errObj = responseHelper.error({
          internal_error_identifier: 'l_c_r_d_2',
          api_error_identifier: 'non_int_cache_value',
          error_config: helper.fetchErrorConfig(),
          debug_options: {byValue: byValue}
        });
        return onResolve(errObj);
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          let errObj = responseHelper.error({
            internal_error_identifier: 'l_c_r_d_3',
            api_error_identifier: 'something_went_wrong',
            error_config: helper.fetchErrorConfig(),
            debug_options: {err: err}
          });
          return onResolve(errObj);
        } else {
          if (data===false) {
            let errObj = responseHelper.error({
              internal_error_identifier: 'l_c_r_d_4',
              api_error_identifier: 'missing_cache_key',
              error_config: helper.fetchErrorConfig(),
              debug_options: {}
            });
            return onResolve(errObj);
          } else {
            return onResolve(responseHelper.successWithData({response: data}));
          }
        }
      };

      if (oThis._isConsistentBehaviour) {
        // Perform action
        var decrementValue = function (result) {
          if (result.isSuccess() && result.data.response > 0) {
            // NOTE: To support memcached implementation
            byValue = (result.data.response < byValue) ? result.data.response : byValue;
            // decrement
            client.decrby(key, byValue, callback);
          } else {
            let errObj = responseHelper.error({
              internal_error_identifier: 'l_c_m_d_5',
              api_error_identifier: 'missing_cache_key',
              error_config: helper.fetchErrorConfig(),
              debug_options: {}
            });
            return onResolve(errObj);
          }
        };

        // NOTE: To support memcached implementation
        oThis.get(key).then(decrementValue);

      } else {
        client.decrby(key, byValue, callback);
      }

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
        let errObj = responseHelper.error({
          internal_error_identifier: 'l_c_r_t_1',
          api_error_identifier: 'invalid_cache_key',
          error_config: helper.fetchErrorConfig(),
          debug_options: {key: key}
        });
        return onResolve(errObj);
      }
      if (lifetime !== parseInt(lifetime, 10) || lifetime < 0 || helper.validateCacheValue(lifetime) === false) {
        let errObj = responseHelper.error({
          internal_error_identifier: 'l_c_r_t_2',
          api_error_identifier: 'cache_expiry_nan',
          error_config: helper.fetchErrorConfig(),
          debug_options: {lifetime: lifetime}
        });
        return onResolve(errObj);
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          let errObj = responseHelper.error({
            internal_error_identifier: 'l_c_r_t_3',
            api_error_identifier: 'something_went_wrong',
            error_config: helper.fetchErrorConfig(),
            debug_options: {err: err}
          });
          return onResolve(errObj);
        } else {
          if (data===0) {
            let errObj = responseHelper.error({
              internal_error_identifier: 'l_c_r_t_4',
              api_error_identifier: 'missing_cache_key',
              error_config: helper.fetchErrorConfig(),
              debug_options: {}
            });
            return onResolve(errObj);
          } else {
            return onResolve(responseHelper.successWithData({response: data}));
          }
        }
      };

      // Perform action
      client.expire(key, lifetime, callback);

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
      client.flushdb(function (err, succeeded) {
        if (err) {
          let errObj = responseHelper.error({
            internal_error_identifier: 'l_c_r_t_5',
            api_error_identifier: 'flush_all_keys_failed',
            error_config: helper.fetchErrorConfig(),
            debug_options: {}
          });
          return onResolve(errObj);
        } else {
          return onResolve(responseHelper.successWithData());
        }
      });
    })
  }

};

module.exports = redisCache;