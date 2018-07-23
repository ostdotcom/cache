## OpenST-cache v1.0.5-beta.3
- We take configuration as openst cache constructor params and then use the config in place of environment variables, where-ever needed.

- Application can create different configurations, instantiate cache for each configuration and then communicate with respective (appropriate) cache instance.

## OpenST-cache v1.0.5-beta.1
- version bump for dependencies

## OpenST-cache v1.0.3
- Logger, response helper, promise context, promise queue manager and web3 from OpenST Base is now used in OpenST cache. OpenST Base repository was created and all the common functionality which different openst modules need were moved to it.

- Log level support was introduced and non-important logs were moved to debug log level.

- Standardized error codes are now being used in OpenST Cache.