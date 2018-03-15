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
        return onResolve(responseHelper.error('l_c_im_g_1', 'Cache key validation failed'));
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
        return onResolve(responseHelper.error('l_c_im_s_1', 'Cache key validation failed'));
      }
      if (helper.validateCacheValue(value) === false) {
        return onResolve(responseHelper.error('l_c_im_s_2', 'Cache value validation failed'));
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
      return Promise.resolve(responseHelper.error('l_c_im_so_1', 'Cache value validation failed'));
    }

    // NOTE: To support redis implementation don't allow array
    if (oThis._isConsistentBehaviour && Array.isArray(object)) {
      return Promise.resolve(responseHelper.error('l_c_im_so_2', 'Cache value cannot be array'));
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
        return onResolve(responseHelper.error('l_c_im_d_1', 'Cache key validation failed'));
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
        return onResolve(responseHelper.error('l_c_im_mg_1', 'Cache keys should be an array'));
      }
      for (var i = 0; i < keys.length; i++) {
        if (helper.validateCacheKey(keys[i]) === false) {
          return onResolve(responseHelper.error('l_c_im_mg_2', 'Cache key('+keys[i]+') validation failed'));
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
        return onResolve(responseHelper.error('l_c_im_i_1', 'Cache key validation failed'));
      }
      if (byValue !== parseInt(byValue, 10) || byValue < 1 || helper.validateCacheValue(byValue) === false) {
        return onResolve(responseHelper.error('l_c_im_i_2', 'Cache value is not an integer'));
      }

      // check if key exists or not
      var record = oThis._getRecord(key);

      if (!record) {
        // NOTE: To support memcached implementation
        if (oThis._isConsistentBehaviour) {
          return onResolve(responseHelper.error('l_c_im_i_3', 'Cache Key does not exist'));
        }

        // Set the record
        var setResponse = await oThis.set(key, 0);
        if (setResponse.isFailure()) {
          return onResolve(setResponse);
        }
        record = oThis._getRecord(key);
        if (!record) {
          return onResolve(responseHelper.error('l_c_im_i_4', 'Cache Key can not be created'));
        }
      }

      // Check exiting value is numeric
      var originalValue = record.getValue();
      if (isNaN(originalValue)) {
        return onResolve(responseHelper.error('l_c_im_i_5', 'Cache Key has non numeric value'));
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
        return onResolve(responseHelper.error('l_c_im_d_1', 'Cache key validation failed'));
      }
      if (byValue !== parseInt(byValue, 10) || byValue < 1 || helper.validateCacheValue(byValue) === false) {
        return onResolve(responseHelper.error('l_c_im_d_2', 'Cache value is not integer'));
      }

      // check if key exists or not
      var record = oThis._getRecord(key);

      if (!record) {
        // NOTE: To support memcached implementation
        if (oThis._isConsistentBehaviour) {
          return onResolve(responseHelper.error('l_c_im_d_3', 'Cache Key does not exist'));
        }

        // Set the record
        var setResponse = await oThis.set(key, 0);
        if (setResponse.isFailure()) {
          return onResolve(setResponse);
        }
        record = oThis._getRecord(key);
        if (!record) {
          return onResolve(responseHelper.error('l_c_im_d_4', 'Cache Key can not be created'));
        }
      }

      // Check exiting value is numeric
      var originalValue = record.getValue();
      if (isNaN(originalValue)) {
        return onResolve(responseHelper.error('l_c_im_d_5', 'Cache Key has non numeric value'));
      }

      // NOTE: To support memcached implementation
      byValue = (originalValue < byValue && oThis._isConsistentBehaviour) ? originalValue : byValue;

      // Perform action
      console.log("Old originalValue ", originalValue);
      originalValue += byValue * -1;
      console.log("New originalValue ", originalValue);
      console.log("byValue ", byValue * -1);
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
        return onResolve(responseHelper.error('l_c_im_t_1', 'Cache key validation failed'));
      }
      if (lifetime !== parseInt(lifetime, 10) || lifetime < 0 || helper.validateCacheValue(lifetime) === false) {
        return onResolve(responseHelper.error('l_c_im_t_2', 'Cache expiry is not a valid number'));
      }

      var record = oThis._getRecord(key);

      if (!record) {
        return onResolve(responseHelper.error('l_c_im_t_3', 'Cache key does not exist'));
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
      onResolve(responseHelper.error('l_c_im_d_6', 'Flush all Cache Keys can not be supported by In-Memory Cache. Please Restart your service to flush cache'));
    })
  }

};