const RateEntity = require('../orm/entity/Rate')

const BaseRepository = require('./BaseRepository')

/**
 * Class representing the RateRepository.
 * @extends {BaseRepository}
 */
class RateRepository extends BaseRepository {
  /**
   * Create a new instance.
   * @param  {Object<Object>} options.dbConnection The database connection.
   * @param  {Object<Object>} [options.logger]     The optional logger.
   * @return {RateRepository}                      A new instance.
   */
  constructor({ dbConnection, logger }) {
    super({ dbConnection, logger })

    this.entity = RateEntity
  }

  /**
   * Get Day rates for a given date and currency pair
   * @param  {Object} date                 Date of the rates.
   * @param  {String} srcCurrency          Source rate currency.
   * @param  {String} destCurrency         Dest rate currency.
   * @param  {Object} [extQueryRunner]     The optional query runner.
   * @return {Promise<Object>}             The results.
   */
  listRatesByDateAndPairAsync(date, srcCurrency, destCurrency, extQueryRunner) {
    const findOptions = {
      where: [{
        date,
        ticker: srcCurrency,
      },
      {
        date,
        ticker: destCurrency,
      }],
    }

    const logData = {
      fn: 'listRatesByDateAndPairAsync',
      args: { findOptions, isExtQueryRunner: !!extQueryRunner },
    }
    return this.findAsync(findOptions, logData, extQueryRunner)
  }
}

module.exports = RateRepository
