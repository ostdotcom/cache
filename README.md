OpenST-Cache
============

OpenST Cache is the central cache implementation for all OpenST products and can easily be plugged-in. 
It contains three caching engines. Decision of which caching engine to use is governed by an ENV variable 
'OST_CACHING_ENGINE'. Caching engines implemented are:

* Memcached
* Redis
* In-process

# Install OpenST Cache

```bash
npm install @openstfoundation/openst-cache --save
```

# Set EVN Variables

##### Select the desired caching engine and default TTL:
```bash
export OST_CACHING_ENGINE='redis' # Possible values are - 'none', 'redis', 'memcached'
export OST_DEFAULT_TTL=3600 # In seconds
```
##### Redis specific ENV variables
```bash
export OST_REDIS_HOST='127.0.0.1'
export OST_REDIS_PORT=6379
export OST_REDIS_PASS=st123 # Redis authentication password defined as "requirepass" 
export OST_REDIS_TLS_ENABLED=0 # Possible values are 1 and 0
```
##### Memcached specific ENV variables
```bash
export OST_MEMCACHE_SERVERS='127.0.0.1:11211' # comma seperated memcached instances eg: '127.0.0.1:11211, 192.168.1.101:11211'
```
# Example:
```js
const openSTCache = require('@openstfoundation/openst-cache')
  , cacheImplementer = openSTCache.cache;
cacheImplementer.set('testKey', 'testValue');
cacheImplementer.get('testKey');
```