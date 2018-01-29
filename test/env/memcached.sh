#!/bin/bash

export OST_DEFAULT_TTL='60'
export OST_CACHING_ENGINE='memcached'
export OST_MEMCACHE_SERVERS='localhost:11212,localhost:11213'