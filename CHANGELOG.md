## Cache v1.0.6
- Follow common JS style guide followed across all OST repos([Cache#30](https://github.com/ostdotcom/cache/issues/30)).
- We take configuration as OST cache constructor params and then use the config in place of environment variables, where-ever needed ([Cache#29](https://github.com/ostdotcom/cache/issues/29)).
- Application can create different configurations, instantiate cache for each configuration and then communicate with respective (appropriate) cache instance.
- version bump for dependencies
- Integrated with new Instance Composer.
- Migrated to ES6.
- Migrated repository from OpenST Foundation to OST organization and renamed it.

## Cache v1.0.5
Minor changes.

## Cache v1.0.3
- Logger, response helper, promise context, promise queue manager and web3 from OST Base is now used in OST Cache. OST Base repository was created and all the common functionality which different openst modules need were moved to it.

- Log level support was introduced and non-important logs were moved to debug log level.

- Standardized error codes are now being used in OST Cache.
