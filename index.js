/**
 * Index File for openst-cache
 */

"use strict";

const rootPrefix = "."
  , version = require(rootPrefix + '/package.json').version
  , cache = require(rootPrefix + '/services/cache')
  , OpenSTCacheKeys = require(rootPrefix + '/services/openst_cache_keys');

const OpenSTCacheManagement = function () {
  const oThis = this;

  oThis.version = version;
  oThis.OpenSTCacheKeys = OpenSTCacheKeys;
  oThis.cache = cache;
};

module.exports = new OpenSTCacheManagement();

