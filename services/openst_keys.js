"use strict";

/**
 *
 * This implementation is very specific to OpenST branded tokens and ST' related cache keys.<br><br>
 *
 * @class OpenSTKeys
 * @constructor
 */
const OpenSTKeys = function () {

  const oThis = this;

  // openST cache key namespace
  oThis.namespace = "openst_";

};

OpenSTKeys.prototype = {

  /**
   * @ignore
   */
  _getCacheKeyForProperty: function (chainId, tokenIdentifier, propName) {
    // Internal Method. Returns key name to be used for caching properties of ERC20 contract and different balances
    const oThis = this;
    return oThis.namespace + chainId + "_" + tokenIdentifier.toLowerCase() + "_prop_" + propName.toLowerCase();
  },

  /**
   * Get Branded Token name cache key
   *
   * @param {Integer} chainId - Branded Token deployed on chain id
   * @param {String} btAddress - address of branded token ERC20 contract
   *
   * @return {String}
   *
   */
  btName: function (chainId, btAddress) {
    const oThis = this;
    return oThis._getCacheKeyForProperty(chainId, btAddress, "name");
  },

  /**
   * Get Branded Token symbol cache key
   *
   * @param {Integer} chainId - Branded Token deployed on chain id
   * @param {String} btAddress - address of branded token ERC20 contract
   *
   * @return {String}
   *
   */
  btSymbol: function (chainId, btAddress) {
    const oThis = this;
    return oThis._getCacheKeyForProperty(chainId, btAddress, "symbol");
  },

  /**
   * Get Branded Token decimals cache key
   *
   * @param {Integer} chainId - Branded Token deployed on chain id
   * @param {String} btAddress - address of branded token ERC20 contract
   *
   * @return {String}
   *
   */
  btDecimals: function (chainId, btAddress) {
    const oThis = this;
    return oThis._getCacheKeyForProperty(chainId, btAddress, "decimals");
  },

  /**
   * Get Branded Token UUID cache key
   *
   * @param {Integer} chainId - Branded Token deployed on chain id
   * @param {String} btAddress - address of branded token ERC20 contract
   *
   * @return {String}
   *
   */
  btUUID: function (chainId, btAddress) {
    const oThis = this;
    return oThis._getCacheKeyForProperty(chainId, btAddress, "uuid");
  },

  /**
   * Get Branded Token balance cache key
   *
   * @param {Integer} chainId - Branded Token deployed on chain id
   * @param {String} btAddress - address of branded token ERC20 contract
   * @param {String} address - address whose balance cache key need to be generated
   *
   * @return {String}
   *
   */
  btBalance: function(chainId, btAddress, address) {
    const oThis = this;
    return oThis._getCacheKeyForProperty(chainId, btAddress, address);
  },

  /**
   * Get ST' balance cache key
   *
   * @param {Integer} chainId - Branded Token deployed on chain id
   * @param {String} address - address whose balance cache key need to be generated
   *
   * @return {String}
   *
   */
  stPrimeBalance: function(chainId, address) {
    const oThis = this;
    return oThis._getCacheKeyForProperty(chainId, 'STPrime', address);
  }

};


module.exports = new OpenSTKeys();