/**
 * Class to extend that adds an optional logger.
 */
class WithOptionalLogger {
  /**
   * Create a new instance.
   * @param  {Object<Object>}     options.logger The logger.
   * @throws {TypeError}                         If some required property is missing.
   * @return {WithOptionalLogger}                A new instance.
   */
  constructor({ logger }) {
    if (logger && typeof logger !== 'object') {
      throw new TypeError(`Invalid "logger" value: ${logger}.`)
    }

    this.logger = logger
      ? logger.child({ module: this.constructor.name })
      : {
        debug: () => {},
        error: () => {},
        info: () => {},
        trace: () => {},
        warn: () => {},
      }
  }
}

module.exports = WithOptionalLogger
