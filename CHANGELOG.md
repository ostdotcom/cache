## OpenST-cache v1.0.5
- Follow common JS style guide followed across all openst repos([openst-cache#30](https://github.com/OpenSTFoundation/openst-cache/issues/30)).

- We take configuration as openst cache constructor params and then use the config in place of environment variables, where-ever needed ([openst-cache#29](https://github.com/OpenSTFoundation/openst-cache/issues/29)).

- Application can create different configurations, instantiate cache for each configuration and then communicate with respective (appropriate) cache instance.

- version bump for dependencies

## OpenST-cache v1.0.3
- Logger, response helper, promise context, promise queue manager and web3 from OpenST Base is now used in OpenST cache. OpenST Base repository was created and all the common functionality which different openst modules need were moved to it.

- Log level support was introduced and non-important logs were moved to debug log level.

- Standardized error codes are now being used in OpenST Cache.
