/**
 * Index File of openst-platform node module
 */

"use strict";

const rootPrefix = "."
  , version = require(rootPrefix + '/package.json').version
  , cacheImplementer = require(rootPrefix + '/lib/cache/implementer')
  , openSTKeys = require(rootPrefix + '/services/openst_keys');

const OpenSTCacheManagement = function () {
  const oThis = this;

  oThis.version = version;
  oThis.openSTKeys = openSTKeys;
  oThis.cache = cacheImplementer;
};

module.exports = OpenSTCacheManagement;

