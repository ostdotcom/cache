/**
 * Index File for openst-cache
 */

"use strict";

const rootPrefix = "."
  , version = require(rootPrefix + '/package.json').version
  , OpenSTCacheKeys = require(rootPrefix + '/services/openst_cache_keys')
  , InstanceComposer = require(rootPrefix + '/instance_composer')
;

require(rootPrefix + '/services/cache_factory');

const OpenSTCache = function (configStrategy) {
  const oThis = this;

  if (!configStrategy) {
    throw "Mandatory argument configStrategy missing";
  }

  const instanceComposer = oThis.ic = new InstanceComposer(configStrategy);

  oThis.version = version;
  oThis.OpenSTCacheKeys = OpenSTCacheKeys;
  oThis.cacheInstance = instanceComposer.getCacheInstance();
};

OpenSTCache.prototype = {};

module.exports = OpenSTCache;