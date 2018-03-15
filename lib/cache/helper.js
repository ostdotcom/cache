'use strict';
/*
 * Cache Helper: Has promisify warpper and different validation methods
 */

// Load internal libraries
const rootPrefix = "../.."
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
;

const helper = {

  // Wrap methodName invocation in a Promise
  promisifyMethod: function (scope, methodName, args) {
    return new Promise(function (onResolve, onReject) {
      args.push(function (err, data) {
        if (err) {
          onResolve(responseHelper.error('l_c_h_1', err));
        } else {
          onResolve(responseHelper.successWithData(data));
        }
      });

      scope[methodName].apply(scope, args);
    });
  }

  // Check if cache key is valid or not
  , validateCacheKey: function (key) {

    var oThis = this;

    if (typeof key !== 'string') {
      console.error('cache key not a string', key);
      return false;
    }

    if (key === '') {
      console.error('cache key should not be blank', key);
      return false;
    }

    if (oThis._validateCacheValueSize(key, 250) !== true) {
      console.error('cache key byte size should not be > 250', key, " size ", oThis._validateCacheValueSize(key, 250));
      return false;
    }

    if (oThis._validateCacheKeyChars(key) !== true) {
      console.error('cache key has unsupported chars', key);
      return false;
    }

    return true;
  }

  // Check if cache value is valid or not
  , validateCacheValue: function (value) {
    var oThis = this;
    return (value !== undefined && oThis._validateCacheValueSize(value, 1024 * 1024) === true) ? true : false;
  }

  // Check if cache expiry is valid or not
  , validateCacheExpiry: function (value) {
    var oThis = this;
    return (value && (typeof value === 'number')) ? true : false;
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