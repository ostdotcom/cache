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
  , helper = require(rootPrefix + '/lib/cache/helper');

// Create connections
const clientOptions = {host: cacheConfig.REDIS_HOST, port: cacheConfig.REDIS_PORT, password: cacheConfig.REDIS_PASS, tls: cacheConfig.REDIS_TLS_ENABLED}
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
   * Get the stored value for the given key.
   *
   * @param {string} key - cache key
   *
   * @return {Promise<mixed>} A promise to return value of the key.
   */
  get: function (key) {
    return helper.promisifyMethod(client, 'get', [key]);
  },

  /**
   * Get the stored object value for the given key.
   *
   * @param {string} key - cache key
   *
   * @return {Promise<object>} A promise to return object of the key.
   */
  getObject: function (key) {
    return helper.promisifyMethod(client, 'hgetall', [key]);
  },

  /**
   * Set a new key value or update the existing key value in cache
   *
   * @param {string} key - cache key
   * @param {mixed} value - number/string value that you want to store.
   *
   * @return {Promise<boolean>} A promise to set the key.  On resolve, the boolean flag indicates if cache was set successfully or not.
   */
  set: function (key, value) {
    return helper.promisifyMethod(client, 'set', [key, value, 'EX', defaultLifetime]);
  },

  /**
   * Set a new key object or update the existing key object in cache
   *
   * @param {string} key - cache key
   * @param {object} object - object value that you want to store.
   *
   * @return {Promise<boolean>} A promise to set the key.  On resolve, the boolean flag indicates if cache was set successfully or not.
   */
  setObject: function (key, object) {
    var arrayRepresentation = [];
    for (var i in object) {
      arrayRepresentation.push(i);
      arrayRepresentation.push(object[i]);
    }

    return helper.promisifyMethod(client, 'hmset', [key, arrayRepresentation]);
  },

  /**
   * Delete the key from cache
   *
   * @param {string} key - cache key
   *
   * @return {Promise<boolean>} A promise to delete. On resolve, the boolean flag indicates if key was valid before deleting.
   */
  del: function (key) {
    return helper.promisifyMethod(client, 'del', [key]);
  },

  /**
   * Get the values of specified keys.
   *
   * @param {array} keys - Array of cache keys
   *
   * @return {Promise<mixed>} A promise to return value of the keys.
   */
  multiGet: function (keys) {
    const mapDataValsToKeys = function (data) {
      var retVal = {};

      for (var i = 0; i < data.length; i++) {
        retVal[keys[i]] = data[i];
      }
      return retVal;
    };

    return helper.promisifyMethod(client, 'mget', [keys]).then(mapDataValsToKeys);
  },

  /**
   * Increment the numeric value for the given key, if key already exists.
   *
   * @param {string} key - cache key
   * @param {number} byValue - number that you want to increment by
   *
   * @return {Promise<boolean>} A promise to increment the numeric value.  On resolve, the boolean flag indicates if value was incremented successfully or not.
   */
  increment: function (key, byValue) {
    if(byValue){
      return helper.promisifyMethod(client, 'incrby', [key, byValue]);
    } else {
      // if the byValue is not passed, we will increment by 1
      return helper.promisifyMethod(client, 'incr', [key]);
    }
  },

  /**
   * Decrement the numeric value for the given key, if key already exists.
   *
   * @param {string} key - cache key
   * @param {number} byValue - number that you want to decrement by
   *
   * @return {Promise<boolean>} A promise to decrement the numeric value.  On resolve, the boolean flag indicates if value was decremented successfully or not.
   */
  decrement: function (key, byValue) {
    if(byValue){
      return helper.promisifyMethod(client, 'decrby', [key, byValue]);
    } else {
      // if the byValue is not passed, we will decrement by 1
      return helper.promisifyMethod(client, 'decr', [key]);
    }
  },

  /**
   * Find cached key and set its new expiry time.
   *
   * @param {string} key - cache key
   * @param {integer} lifetime - number that you want to set as expiry
   *
   * @return {Promise<boolean>} A promise to update the expiry of record.  On resolve, the boolean flag indicates if record was updated successfully or not.
   */
  touch: function (key, lifetime) {
    return helper.promisifyMethod(client, 'expire', [key, lifetime]);
  }
};

module.exports = new redisCache();