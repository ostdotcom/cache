'use strict';
/**
 * Implementation of the caching layer using in-process memory.<br><br>
 * <b>NOTE: This should only be used for dev env having only one worker process,
 * otherwise this will result in inconsistent cache.</b><br><br>
 *
 * @module lib/cache/in_memory
 */

/**
 * Constructor to manage cache in memory.
 *
 * @constructor
 */
const inMemoryCache = function () {
    this._records = Object.create( null );
};

inMemoryCache.prototype = {
  _records: null,

  /**
   * Get the stored value for the given key.
   *
   * @param {string} key - cache key
   *
   * @return {Promise<mixed>} A promise to return value of the key.
   */
  get: function (key) {
    const oThis = this;
    return new Promise(function (onResolve, onReject) {
      var record = oThis._getRecord(key);
      const val  = record ? record.getValue() : null;
      onResolve(val);
    })
  },

  /**
   * Get the stored object value for the given key. Internally call get method
   *
   * @param {string} key - cache key
   *
   * @return {Promise<mixed>} A promise to return value of the key.
   */
  getObject: function (key) {
    return this.get(key);
  },

  /**
   * Set a new key value or update the existing key value in cache
   *
   * @param {string} key - cache key
   * @param {mixed} value - JSON/number/string that you want to store.
   *
   * @return {Promise<boolean>} A promise to set the key.  On resolve, the boolean flag indicates if cache was set successfully or not.
   */
  set: function (key, value) {
    const oThis = this;
    return new Promise(function (onResolve, onReject) {
      var record = oThis._getRecord(key);
      if(record){
        record.setValue(value);
      } else {
        record = new Record(value, FarFutureLifeTime);
      }
      oThis._records[key] = record;
      onResolve(true);
    })
  },

  /**
   * Set a new key object or update the existing key object in cache. Internally call set method
   *
   * @param {string} key - cache key
   * @param {mixed} object - JSON/number/string value that you want to store.
   *
   * @return {Promise<boolean>} A promise to set the key.  On resolve, the boolean flag indicates if cache was set successfully or not.
   */
  setObject: function (key, object) {
    return this.set(key,object);
  },

  /**
   * Delete the key from cache
   *
   * @param {string} key - cache key
   *
   * @return {Promise<boolean>} A promise to delete the key.  On resolve, the boolean flag indicates if cache was deleted successfully or not.
   */
  del: function (key) {
    const oThis = this;
    return new Promise(function (onResolve, onReject) {
      var record = oThis._getRecord(key);
      if(record){
        delete oThis._records[ key ];
      }
      onResolve(true);
    })
  },

  /**
   * Get the values of specified keys.
   *
   * @param {array} keys - Array of cache keys
   *
   * @return {Promise<mixed>} A promise to return value of the keys.
   */
  multiGet: function (keys) {
    const oThis = this;
    return new Promise(function (onResolve, onReject) {
      var retVal = {};
      if(Array.isArray(keys)){
        for(var i=0;i<keys.length;i++){
          var key = keys[i];
          var record = oThis._getRecord(key);
          var val = record ? record.getValue() : null;
          retVal[key] = val;
        }
        onResolve(retVal);
      } else {
        onReject("Invalid parameter, requires Array");
      }
    })
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
    const oThis = this;
    return new Promise(function (onResolve, onReject) {
      var record = oThis._getRecord(key);
      if(record){
        var originalValue = record.getValue();
        if(isNaN(originalValue)){
          onReject('cannot increment or decrement non-numeric value');
        } else {
          originalValue += byValue;
          record.setValue(originalValue);
          onResolve(true);
        }
      }
      onReject('Record not found');
    })
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
    return this.increment(key, byValue*-1);
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
    const oThis = this;
    return new Promise(function (onResolve, onReject) {
      var record = oThis._getRecord(key);
      if(record){
          record.setExpires(lifetime);
          onResolve(true);
      }
      onReject('Record not found');
    })
  },

  /**
   * Internal method to get record Object for a given key
   *
   * @param {string} key - cache key
   */
  _getRecord: function ( key ) {
    var record = null;
    if ( key in this._records ) {
      record = this._records[ key ];
      if ( record.hasExpired() ) {
        delete this._records[ key ];
        record = null;
      }
    }
    return record;
  }
};

module.exports = new inMemoryCache();

const FarFutureLifeTime = Date.now() + (1000 * 60 * 60 * 24 * 365 * 20);

function Record( value, lifetimeInSec ) {
  this.setValue( value );
  lifetimeInSec && this.setExpires( lifetimeInSec );
}

Record.prototype = {
  constructor: Record

  /**
   * @property val Value of record. Defaults to null.
   */
  ,val: null

  /**
   * @property expires Expiry timestamp of record. Defaults to FarFutureLifeTime (20 years from server start time).
   */
  ,expires: Date.now() + FarFutureLifeTime


  /**
   * Sets the expiry timestamp of the record.
   * @param {number} lifetimeInSec life-time is seconds after which record is considered expired.
   */
  ,setExpires: function ( lifetimeInSec ) {
    lifetimeInSec = Number ( lifetimeInSec );
    if ( isNaN( lifetimeInSec ) ) {
        lifetimeInSec = 0;
    }

    var lifetime = lifetimeInSec * 1000;
    if ( lifetime <= 0 ) {
        this.expires = FarFutureLifeTime;
    } else {
        this.expires = Date.now() + lifetime;
    }
  }

  /**
   * @return {boolean} returns true if the current time is greater than expiry timestamp.
   */

  ,hasExpired: function () {
    return ( this.expires - Date.now() ) < 0;
  }

  /**
   * @return {mixed} returns the value set of the record.
   */

  ,getValue: function () {
    return this.val;
  }

  /**
   * Sets the value of the record.
   * @parma {mixed} Value to set.
   */
  ,setValue: function ( val ) {
    this.val = val;
  }

  /**
   * Returns the serialized value of record.
   * If value is Object, serialized object is returned.
   * @return {string} serialized value
   */
  ,toString: function () {
    if ( this.val instanceof Object ) {
        return JSON.stringify( this.val )
    }
    return String( this.val );
  }
};