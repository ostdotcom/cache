'use strict';
/*
 * Cache Helper: Has promisify wrapper and different validation methods
 *
 */

// Load internal libraries
const rootPrefix = "../.."
  , logger = require(rootPrefix + '/lib/logger/custom_console_logger')
  , generalErrorConfig = require(rootPrefix + '/config/error/general')
;

const helper = {
  // Check if cache key is valid or not
  validateCacheKey: function (key) {
    const oThis = this
    ;

    if (typeof key !== 'string') {
      logger.error('cache key not a string', key);
      return false;
    }

    if (key === '') {
      logger.error('cache key should not be blank', key);
      return false;
    }

    if (oThis._validateCacheValueSize(key, 250) !== true) {
      logger.error('cache key byte size should not be > 250', key, " size ", oThis._validateCacheValueSize(key, 250));
      return false;
    }

    if (oThis._validateCacheKeyChars(key) !== true) {
      logger.error('cache key has unsupported chars', key);
      return false;
    }

    return true;
  }

  // Check if cache value is valid or not
  , validateCacheValue: function (value) {
    const oThis = this
    ;

    return (value !== undefined && oThis._validateCacheValueSize(value, 1024 * 1024) === true) ? true : false;
  }

  // Check if cache expiry is valid or not
  , validateCacheExpiry: function (value) {
    const oThis = this
    ;

    return (value && (typeof value === 'number')) ? true : false;
  }

  // Fetch the error config to use for getting the error details
  , fetchErrorConfig: function () {
    return {
      param_error_config: {},
      api_error_config: generalErrorConfig
    }
  }

  // check if cache value size is < size
  , _validateCacheValueSize: function (value, size) {
    return Buffer.byteLength(JSON.stringify(value), 'utf8') <= size ? true : false;
  }

  // check key has valid chars
  , _validateCacheKeyChars: function (key) {
    return /\s/.test(key) ? false : true;
  }

};

module.exports = helper;