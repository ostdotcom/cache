'use strict';
/**
 * Implementation of the caching layer using in-process memory.<br><br>
 * <b>NOTE: This should only be used for dev env having only one worker process,
 * otherwise this will result in inconsistent cache.</b><br><br>
 *
 * @module lib/cache/in_memory
 */

// Load internal libraries and create instances
const rootPrefix = "../.."
  , helper = require(rootPrefix + '/lib/cache/helper')
  , cacheConfig = require(rootPrefix + '/config/cache')
  , defaultLifetime = Number(cacheConfig.DEFAULT_TTL)
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
  , logger = require(rootPrefix + '/lib/logger/custom_console_logger')
;

/**
 * Constructor to manage cache in memory.
 *
 * @param {boolean} isConsistentBehaviour - specifies if the cache behaviour be consistent accross all cache engines
 *
 * @constructor
 */
const inMemoryCache = function (isConsistentBehaviour) {
  const oThis = this;
  oThis._records = Object.create(null);
  oThis._isConsistentBehaviour = isConsistentBehaviour===false ? false : true;
};

inMemoryCache.prototype = {
  _records: null,
  _isConsistentBehaviour: null,

  /**
   * Get the cached value of a key.
   *
   * @param {string} key - cache key
   *
   * @return {Promise<Result>} - On success, data.value has value. On failure, error details returned.
   */
  get: function (key) {
    const oThis = this;
    return new Promise(function (onResolve, onReject) {
      // validate key and value
      if (helper.validateCacheKey(key) === false) {
        let errObj = responseHelper.error({
          internal_error_identifier: 'l_c_im_g_1',
          api_error_identifier: 'invalid_cache_key',
          error_config: helper.fetchErrorConfig(),
          debug_options: {key: key}
        });
        return onResolve(errObj);
      }

      // process action
      var record = oThis._getRecord(key);
      const val = record ? record.getValue() : null;
      return onResolve(responseHelper.successWithData({response: val}));
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
  set: function (key, value, ttl) {
    const oThis = this;
    return new Promise(function (onResolve, onReject) {

      // validate key and value
      if (helper.validateCacheKey(key) === false) {
        let errObj = responseHelper.error({
          internal_error_identifier: 'l_c_im_s_1',
          api_error_identifier: 'invalid_cache_key',
          error_config: helper.fetchErrorConfig(),
          debug_options: {key: key}
        });
        return onResolve(errObj);
      }
      if (helper.validateCacheValue(value) === false) {
        let errObj = responseHelper.error({
          internal_error_identifier: 'l_c_im_s_2',
          api_error_identifier: 'invalid_cache_value',
          error_config: helper.fetchErrorConfig(),
          debug_options: {value: value}
        });
        return onResolve(errObj);
      }
      if (helper.validateCacheExpiry(ttl) === false) {
        ttl = defaultLifetime;
      }

      // Perform action
      var record = oThis._getRecord(key);
      if (record) {
        record.setValue(value);
      } else {
        record = new Record(value, ttl);
      }
      oThis._records[key] = record;

      return onResolve(responseHelper.successWithData({response: true}));

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
      let errObj = responseHelper.error({
        internal_error_identifier: 'l_c_im_so_1',
        api_error_identifier: 'invalid_cache_value',
        error_config: helper.fetchErrorConfig()
      });
      return Promise.resolve(errObj);
    }

    // NOTE: To support redis implementation don't allow array
    if (oThis._isConsistentBehaviour && Array.isArray(object)) {
      let errObj = responseHelper.error({
        internal_error_identifier: 'l_c_im_so_2',
        api_error_identifier: 'array_is_invalid_cache_value',
        error_config: helper.fetchErrorConfig()
      });
      return Promise.resolve(errObj);
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
  del: function (key) {
    const oThis = this;
    return new Promise(function (onResolve, onReject) {
      // validate key and value
      if (helper.validateCacheKey(key) === false) {
        let errObj = responseHelper.error({
          internal_error_identifier: 'l_c_im_d_1',
          api_error_identifier: 'invalid_cache_key',
          error_config: helper.fetchErrorConfig(),
          debug_options: {key: key}
        });
        return onResolve(errObj);
      }

      // Perform action
      var record = oThis._getRecord(key);
      if (record) {
        delete oThis._records[key];
      }
      return onResolve(responseHelper.successWithData({response: true}));
    });
  },

  /**
   * Get the values of specified keys.
   *
   * @param {array} keys - cache keys
   *
   * @return {Promise<Result>} - On success, data.value is object of keys and values. On failure, error details returned.
   */
  multiGet: function (keys) {
    const oThis = this;
    return new Promise(function (onResolve, onReject) {
      // Validate keys
      if (!Array.isArray(keys) || keys.length == 0) {
        let errObj = responseHelper.error({
          internal_error_identifier: 'l_c_im_mg_1',
          api_error_identifier: 'cache_keys_non_array',
          error_config: helper.fetchErrorConfig()
        });
        return onResolve(errObj);
      }
      for (var i = 0; i < keys.length; i++) {
        if (helper.validateCacheKey(keys[i]) === false) {
          let errObj = responseHelper.error({
            internal_error_identifier: 'l_c_im_mg_2',
            api_error_identifier: 'invalid_cache_key',
            error_config: helper.fetchErrorConfig(),
            debug_options: {invalid_key: keys[i]}
          });
          return onResolve(errObj);
        }
      }

      // Perform action
      var retVal = {};
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var record = oThis._getRecord(key);
        var val = record ? record.getValue() : null;
        // match behaviour with redis
        val = (typeof val === 'object') ? null : val;
        retVal[key] = val;
      }
      onResolve(responseHelper.successWithData({response: retVal}));

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
    byValue = byValue === undefined ? 1 : byValue;

    return new Promise(async function (onResolve, onReject) {
      // validate key and value
      if (helper.validateCacheKey(key) === false) {
        let errObj = responseHelper.error({
          internal_error_identifier: 'l_c_im_i_1',
          api_error_identifier: 'invalid_cache_key',
          error_config: helper.fetchErrorConfig(),
          debug_options: {key: key}
        });
        return onResolve(errObj);
      }
      if (byValue !== parseInt(byValue, 10) || byValue < 1 || helper.validateCacheValue(byValue) === false) {
        let errObj = responseHelper.error({
          internal_error_identifier: 'l_c_im_i_2',
          api_error_identifier: 'non_int_cache_value',
          error_config: helper.fetchErrorConfig(),
          debug_options: {byValue: byValue}
        });
        return onResolve(errObj);
      }

      // check if key exists or not
      var record = oThis._getRecord(key);

      if (!record) {
        // NOTE: To support memcached implementation
        if (oThis._isConsistentBehaviour) {
          let errObj = responseHelper.error({
            internal_error_identifier: 'l_c_im_i_3',
            api_error_identifier: 'missing_cache_key',
            error_config: helper.fetchErrorConfig(),
            debug_options: {}
          });
          return onResolve(errObj);
        }

        // Set the record
        var setResponse = await oThis.set(key, 0);
        if (setResponse.isFailure()) {
          return onResolve(setResponse);
        }
        record = oThis._getRecord(key);
        if (!record) {
          let errObj = responseHelper.error({
            internal_error_identifier: 'l_c_im_i_4',
            api_error_identifier: 'missing_cache_key',
            error_config: helper.fetchErrorConfig(),
            debug_options: {}
          });
          return onResolve(errObj);
        }
      }

      // Check exiting value is numeric
      var originalValue = record.getValue();
      if (isNaN(originalValue)) {
        let errObj = responseHelper.error({
          internal_error_identifier: 'l_c_im_i_5',
          api_error_identifier: 'non_numeric_cache_value',
          error_config: helper.fetchErrorConfig(),
          debug_options: {}
        });
        return onResolve(errObj);
      }

      // Perform action
      originalValue += byValue;
      record.setValue(originalValue);
      return onResolve(responseHelper.successWithData({response: originalValue}));

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
    byValue = byValue === undefined ? 1 : byValue;

    return new Promise(async function (onResolve, onReject) {
      // validate key and value
      if (helper.validateCacheKey(key) === false) {
        let errObj = responseHelper.error({
          internal_error_identifier: 'l_c_im_d_1',
          api_error_identifier: 'invalid_cache_key',
          error_config: helper.fetchErrorConfig(),
          debug_options: {key: key}
        });
        return onResolve(errObj);
      }
      if (byValue !== parseInt(byValue, 10) || byValue < 1 || helper.validateCacheValue(byValue) === false) {
        let errObj = responseHelper.error({
          internal_error_identifier: 'l_c_im_d_2',
          api_error_identifier: 'non_int_cache_value',
          error_config: helper.fetchErrorConfig(),
          debug_options: {byValue: byValue}
        });
        return onResolve(errObj);
      }

      // check if key exists or not
      var record = oThis._getRecord(key);

      if (!record) {
        // NOTE: To support memcached implementation
        if (oThis._isConsistentBehaviour) {
          let errObj = responseHelper.error({
            internal_error_identifier: 'l_c_im_d_3',
            api_error_identifier: 'missing_cache_key',
            error_config: helper.fetchErrorConfig(),
            debug_options: {}
          });
          return onResolve(errObj);
        }

        // Set the record
        var setResponse = await oThis.set(key, 0);
        if (setResponse.isFailure()) {
          return onResolve(setResponse);
        }
        record = oThis._getRecord(key);
        if (!record) {
          let errObj = responseHelper.error({
            internal_error_identifier: 'l_c_im_d_4',
            api_error_identifier: 'missing_cache_key',
            error_config: helper.fetchErrorConfig(),
            debug_options: {}
          });
          return onResolve(errObj);
        }
      }

      // Check exiting value is numeric
      var originalValue = record.getValue();
      if (isNaN(originalValue)) {
        let errObj = responseHelper.error({
          internal_error_identifier: 'l_c_im_d_5',
          api_error_identifier: 'non_numeric_cache_value',
          error_config: helper.fetchErrorConfig(),
          debug_options: {}
        });
        return onResolve(errObj);
      }

      // NOTE: To support memcached implementation
      byValue = (originalValue < byValue && oThis._isConsistentBehaviour) ? originalValue : byValue;

      // Perform action
      logger.debug("Old originalValue ", originalValue);
      originalValue += byValue * -1;
      logger.debug("New originalValue ", originalValue);
      logger.debug("byValue ", byValue * -1);
      record.setValue(originalValue);
      return onResolve(responseHelper.successWithData({response: originalValue}));

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
          internal_error_identifier: 'l_c_im_t_1',
          api_error_identifier: 'invalid_cache_key',
          error_config: helper.fetchErrorConfig(),
          debug_options: {key: key}
        });
        return onResolve(errObj);
      }
      if (lifetime !== parseInt(lifetime, 10) || lifetime < 0 || helper.validateCacheValue(lifetime) === false) {
        let errObj = responseHelper.error({
          internal_error_identifier: 'l_c_im_t_2',
          api_error_identifier: 'cache_expiry_nan',
          error_config: helper.fetchErrorConfig(),
          debug_options: {lifetime: lifetime}
        });
        return onResolve(errObj);
      }

      var record = oThis._getRecord(key);

      if (!record) {
        let errObj = responseHelper.error({
          internal_error_identifier: 'l_c_im_t_3',
          api_error_identifier: 'missing_cache_key',
          error_config: helper.fetchErrorConfig(),
          debug_options: {}
        });
        return onResolve(errObj);
      }

      // Perform action
      record.setExpires(lifetime);
      return onResolve(responseHelper.successWithData({response: true}));

    });
  },

  /**
   * Internal method to get record Object for a given key
   *
   * @param {string} key - cache key
   */
  _getRecord: function (key) {
    var record = null;
    if (key in this._records) {
      record = this._records[key];
      if (record.hasExpired()) {
        delete this._records[key];
        record = null;
      }
    }
    return record;
  }
};

module.exports = inMemoryCache;

const FarFutureLifeTime = Date.now() + (1000 * 60 * 60 * 24 * 365 * 20);

function Record(value, lifetimeInSec) {
  this.setValue(value);
  lifetimeInSec && this.setExpires(lifetimeInSec);
}

Record.prototype = {
  constructor: Record

  /**
   * @property val Value of record. Defaults to null.
   */
  , val: null

  /**
   * @property expires Expiry timestamp of record. Defaults to FarFutureLifeTime (20 years from server start time).
   */
  , expires: Date.now() + FarFutureLifeTime


  /**
   * Sets the expiry timestamp of the record.
   * @param {number} lifetimeInSec life-time is seconds after which record is considered expired.
   */
  , setExpires: function (lifetimeInSec) {
    lifetimeInSec = Number(lifetimeInSec);
    if (isNaN(lifetimeInSec)) {
      lifetimeInSec = 0;
    }

    var lifetime = lifetimeInSec * 1000;
    if (lifetime <= 0) {
      this.expires = Date.now();
    } else {
      this.expires = Date.now() + lifetime;
    }
  }

  /**
   * @return {boolean} returns true if the current time is greater than expiry timestamp.
   */

  , hasExpired: function () {
    return ( this.expires - Date.now() ) <= 0;
  }

  /**
   * @return {mixed} returns the value set of the record.
   */

  , getValue: function () {
    return this.val;
  }

  /**
   * Sets the value of the record.
   * @parma {mixed} Value to set.
   */
  , setValue: function (val) {
    this.val = val;
  }

  /**
   * Returns the serialized value of record.
   * If value is Object, serialized object is returned.
   * @return {string} serialized value
   */
  , toString: function () {
    if (this.val instanceof Object) {
      return JSON.stringify(this.val)
    }
    return String(this.val);
  },

  /**
   * Delete all keys from cache
   *
   * @return {Promise<Result>}
   */
  delAll: function() {
    const oThis = this;
    return new Promise(function (onResolve, onReject) {
      let errObj = responseHelper.error({
        internal_error_identifier: 'l_c_im_d_6',
        api_error_identifier: 'flush_all_not_supported',
        error_config: helper.fetchErrorConfig(),
        debug_options: {}
      });
      return onResolve(errObj);
    })
  }

};