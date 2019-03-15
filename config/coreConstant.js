'use strict';
/**
 * Load all the core constants.
 *
 * @module config/coreConstant
 */

class CoreConstant {
  /**
   * Constructor for core constants
   *
   * @constructor
   */
  constructor() {}
  
  /**
   * Get IC Namespace
   *
   * @returns {string}
   */
  get icNameSpace() {
    return 'OSTCache';
  }
  
  /**
   * Debug Enabled
   *
   * @returns {boolean}
   */
  get DEBUG_ENABLED() {
    return process.env.OST_DEBUG_ENABLED;
  }
}

module.exports = new CoreConstant();
