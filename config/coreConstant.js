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
   * Web3 pool size
   *
   * @returns {*}
   */
  get icNameSpace() {
    return 'OSTCache';
  }
}

module.exports = new CoreConstant();
