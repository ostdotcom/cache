const OSTBase = require('@ostdotcom/base'),
  Logger = OSTBase.Logger;

const rootPrefix = '../..',
  coreConstants = require(rootPrefix + '/config/coreConstant');

// Following is to ensure that INFO logs are printed when debug is off.
const loggerLevel = Number(coreConstants.DEBUG_ENABLED) === 1 ? Logger.LOG_LEVELS.DEBUG : Logger.LOG_LEVELS.INFO;

module.exports = new Logger('ost-cache', loggerLevel);
