'use strict';

/**
 *
 * This implementation is very specific to OpenST branded tokens and ST' related cache keys.<br><br>
 *
 * @class OpenSTCacheKeys
 * @constructor
 */
class OpenSTCacheKeys {
  constructor() {
    const oThis = this;

    // openST cache key namespace
    oThis.namespace = 'openst_';
  }

  /**
   * @ignore
   */
  _getCacheKeyForProperty(chainId, tokenIdentifier, propName) {
    // Internal Method. Returns key name to be used for caching properties of ERC20 contract and different balances
    const oThis = this;
    return oThis.namespace + chainId + '_' + tokenIdentifier.toLowerCase() + '_prop_' + propName.toLowerCase();
  }

  /**
   * Get Branded Token name cache key
   *
   * @param {Integer} chainId - Branded Token deployed on chain id
   * @param {String} btAddress - address of branded token ERC20 contract
   *
   * @return {String}
   *
   */
  btName(chainId, btAddress) {
    const oThis = this;
    return oThis._getCacheKeyForProperty(chainId, btAddress, 'name');
  }

  /**
   * Get Branded Token symbol cache key
   *
   * @param {Integer} chainId - Branded Token deployed on chain id
   * @param {String} btAddress - address of branded token ERC20 contract
   *
   * @return {String}
   *
   */
  btSymbol(chainId, btAddress) {
    const oThis = this;
    return oThis._getCacheKeyForProperty(chainId, btAddress, 'symbol');
  }

  /**
   * Get Branded Token decimals cache key
   *
   * @param {Integer} chainId - Branded Token deployed on chain id
   * @param {String} btAddress - address of branded token ERC20 contract
   *
   * @return {String}
   *
   */
  btDecimals(chainId, btAddress) {
    const oThis = this;
    return oThis._getCacheKeyForProperty(chainId, btAddress, 'decimals');
  }

  /**
   * Get Branded Token UUID cache key
   *
   * @param {Integer} chainId - Branded Token deployed on chain id
   * @param {String} btAddress - address of branded token ERC20 contract
   *
   * @return {String}
   *
   */
  btUUID(chainId, btAddress) {
    const oThis = this;
    return oThis._getCacheKeyForProperty(chainId, btAddress, 'uuid');
  }

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
  btBalance(chainId, btAddress, address) {
    const oThis = this;
    return oThis._getCacheKeyForProperty(chainId, btAddress, address);
  }

  /**
   * Get ST' balance cache key
   *
   * @param {Integer} chainId - Branded Token deployed on chain id
   * @param {String} address - address whose balance cache key need to be generated
   *
   * @return {String}
   *
   */
  stPrimeBalance(chainId, address) {
    const oThis = this;
    return oThis._getCacheKeyForProperty(chainId, 'STPrime', address);
  }

  /**
   * Get price oracle cache key
   *
   * @param {Integer} chainId - Price oracle chain id
   * @param {String} address - address whose balance cache key need to be generated
   *
   * @return {String}
   *
   */
  oraclePricePoint(chainId, address) {
    const oThis = this;
    return oThis._getCacheKeyForProperty(chainId, address, 'oracle_price');
  }

  /**
   * Get price oracle expiration height cache key
   *
   * @param {Integer} chainId - Price oracle chain id
   * @param {String} address - address whose balance cache key need to be generated
   *
   * @return {String}
   *
   */
  oracleExpirationHeight(chainId, address) {
    const oThis = this;
    return oThis._getCacheKeyForProperty(chainId, address, 'oracle_expiration_height');
  }
}

module.exports = new OpenSTCacheKeys();
