"use strict";
/*
 * Cache Related Constants:
 *
 * Load caching layer related constant variables from environment variables
 *
 */

// Function to define Global variables
function define(name, value) {
  Object.defineProperty(exports, name, {
    value: value,
    enumerable: true
  });
}

// Default cache TTL (in seconds)
define("DEFAULT_TTL", process.env.OST_DEFAULT_TTL);

// Constants for redis caching layer
define("REDIS_HOST", process.env.OST_REDIS_HOST);
define("REDIS_PORT", process.env.OST_REDIS_PORT);
define("REDIS_PASS", process.env.OST_REDIS_PASS);
define("REDIS_TLS_ENABLED", process.env.OST_REDIS_TLS_ENABLED == '1' ? true : false);

// Constants for memcached caching layer
define("MEMCACHE_SERVERS", (process.env.OST_MEMCACHE_SERVERS || '').split(',').map(Function.prototype.call, String.prototype.trim));
