OpenST Cache
============
[![Latest version](https://img.shields.io/npm/v/@openstfoundation/openst-cache.svg?maxAge=3600)][npm]
[![Travis](https://img.shields.io/travis/OpenSTFoundation/openst-cache.svg?maxAge=600)][travis]
[![Downloads per month](https://img.shields.io/npm/dm/@openstfoundation/openst-cache.svg?maxAge=3600)][npm]
[![Gitter](https://img.shields.io/gitter/room/OpenSTFoundation/github.js.svg?maxAge=3600)][gitter]

OpenST Cache is the central cache implementation for all OpenST products and can easily be plugged-in. 
It contains three caching engines. The decision of which caching engine to use is governed by an ENV variable, `OST_CACHING_ENGINE`. The caching engines implemented are:

* Memcached
* Redis
* In-process (use with single threaded process in development mode only)

# Install OpenST Cache

```bash
npm install @openstfoundation/openst-cache --save
```

# Set ENV Variables

#### Select the desired caching engine and default TTL:
```bash
export OST_CACHING_ENGINE='redis' # Possible values are - 'none', 'redis', 'memcached'
export OST_DEFAULT_TTL=3600 # In seconds
```
#### If `OST_CACHING_ENGINE` is Redis, set the following ENV variables:
```bash
export OST_REDIS_HOST='127.0.0.1'
export OST_REDIS_PORT=6379
export OST_REDIS_PASS=st123 # Redis authentication password defined as "requirepass" 
export OST_REDIS_TLS_ENABLED=0 # Possible values are 1 and 0
```
#### If `OST_CACHING_ENGINE` is memcached, set the following ENV variable:
```bash
export OST_MEMCACHE_SERVERS='127.0.0.1:11211' # comma seperated memcached instances eg: '127.0.0.1:11211, 192.168.1.101:11211'
```
# Examples:

#### Create OpenST Cache Object:
```js
const openSTCache = require('@openstfoundation/openst-cache');
const cacheImplementer = openSTCache.cache;
```

#### Store and retrieve data in cache using `set` and `get`:
```js
cacheImplementer.set('testKey', 'testValue', 5000).then(function(cacheResponse){
    if (cacheResponse.isSuccess()) {
      console.log(cacheResponse.data.response);
    } else {
      console.log(cacheResponse);
    }
  });
cacheImplementer.get('testKey').then(function(cacheResponse){
    if (cacheResponse.isSuccess()) {
      console.log(cacheResponse.data.response);
    } else {
      console.log(cacheResponse);
    }
  });
```

#### Manage objects in cache using `setObject` and `getObject`:
```js
cacheImplementer.setObject('testObjKey', {dataK1: 'a', dataK2: 'b'}).then(function(cacheResponse){
    if (cacheResponse.isSuccess()) {
      console.log(cacheResponse.data.response);
    } else {
      console.log(cacheResponse);
    }
  });
cacheImplementer.getObject('testObjKey').then(function(cacheResponse){
    if (cacheResponse.isSuccess()) {
      console.log(cacheResponse.data.response);
    } else {
      console.log(cacheResponse);
    }
  });
```

#### Retrieve multiple cache data using `multiGet`:
###### * <b>NOTE: Redis returns null from `multiGet` for objects, even if a value is set in the cache; the other caching engines match this behaviour.</b>
```js
cacheImplementer.set('testKeyOne', 'One').then(console.log);
cacheImplementer.set('testKeyTwo', 'Two').then(console.log);
cacheImplementer.multiGet(['testKeyOne', 'testKeyTwo']).then(function(cacheResponse){
    if (cacheResponse.isSuccess()) {
      console.log(cacheResponse.data.response);
    } else {
      console.log(cacheResponse);
    }
  });
```

#### Delete cache using `del`:
```js
cacheImplementer.set('testKey', 'testValue').then(console.log);
cacheImplementer.del('testKey').then(function(cacheResponse){
    if (cacheResponse.isSuccess()) {
      console.log(cacheResponse.data.response);
    } else {
      console.log(cacheResponse);
    }
  });
```

#### Manage counters in cache using `increment` and `decrement`: 
```js
cacheImplementer.set('testCounterKey', 1).then(console.log);
cacheImplementer.increment('testCounterKey', 10).then(function(cacheResponse){
    if (cacheResponse.isSuccess()) {
      console.log(cacheResponse.data.response);
    } else {
      console.log(cacheResponse);
    }
  });
cacheImplementer.decrement('testCounterKey', 5).then(function(cacheResponse){
    if (cacheResponse.isSuccess()) {
      console.log(cacheResponse.data.response);
    } else {
      console.log(cacheResponse);
    }
  });
```

#### Change the cache expiry time using `touch`:
```js
cacheImplementer.set('testKey', "testData").then(console.log);
cacheImplementer.touch('testKey', 10).then(function(cacheResponse){
    if (cacheResponse.isSuccess()) {
      console.log(cacheResponse.data.response);
    } else {
      console.log(cacheResponse);
    }
  });
```

For further implementation details, please refer to the [API documentation][api-docs].

[gitter]: https://gitter.im/OpenSTFoundation/SimpleToken
[npm]: https://www.npmjs.com/package/@openstfoundation/openst-cache
[travis]: https://travis-ci.org/OpenSTFoundation/openst-cache
[api-docs]: https://openstfoundation.github.io/openst-cache/