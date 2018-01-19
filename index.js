/**
 * Index File for openst-cache
 */

"use strict";

const rootPrefix = "."
  , version = require(rootPrefix + '/package.json').version
  , cache = require(rootPrefix + '/services/cache')
  , openSTKeys = require(rootPrefix + '/services/openst_keys');

const OpenSTCacheManagement = function () {
  const oThis = this;

  oThis.version = version;
  oThis.openSTKeys = openSTKeys;
  oThis.cache = cache;
};

module.exports = new OpenSTCacheManagement();

