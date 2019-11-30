const _ = require('lodash')

const ConvertError = require('../errors/ConvertError')
const ConvertCalculateError = require('../errors/ConvertCalculateError')
const NotFoundError = require('../errors/NotFoundError')
const NumberOfRatesError = require('../errors/NumberOfRatesError')
const SameCurrencyError = require('../errors/SameCurrencyError')
const ListRatesByDateAndPairError = require('../errors/ListRatesByDateAndPairError')
const WithOptionalLogger = require('../helpers/WithOptionalLogger')

/**
 * Class implementing the currency converter service.
 * @extends {WithOptionalLogger}
 */
class ConverterService extends WithOptionalLogger {
  /**
   * Create a new instance.
   * @param  {Object<Object>} options.rateRepository The RateRepository instance.
   * @param  {Object<Object>} [options.logger]       The logger instance.
   * @throws {TypeError}                             If some required property is missing.
   * @return {ConverterService}                      A new instance.
   */
  constructor({ rateRepository, logger }) {
    super({ logger })

    if (!rateRepository || typeof rateRepository !== 'object') {
      throw new TypeError(`Invalid "rateRepository" value: ${rateRepository}.`)
    }

    this.rateRepository = rateRepository
  }

  /**
   * The conversion calculation.
   * @param  {String} amount         The amount to be converted.
   * @param  {Object} srcRateData    The conversion source currency.
   * @param  {Object} destRateData   The conversion destination currency.
   * @throws {ConvertCalculateError} If some occurs during the calculation.
   * @return {Number}                The calculation result.
   */
  calculateConversion(amount, srcRateData, destRateData) {
    try {
      let result
      const { ticker: srcTicker, rate: srcRate } = srcRateData
      const { ticker: destTicker, rate: destRate } = destRateData

      const data = [amount, srcRate, destRate]

      if (_.some(data, currAmount => isNaN(currAmount))) {
        throw new TypeError()
      }

      const [parsedAmount, parsedSrcRate, parsedDestRate] = data.map(item => parseFloat(item))

      if (destTicker === 'EUR') {
        result = (parsedAmount / parsedSrcRate).toFixed(4).toString()
      } else if (srcTicker === 'EUR') {
        result = (parsedAmount * parsedDestRate).toFixed(4).toString()
      } else {
        result = ((parsedAmount / parsedSrcRate) * parsedDestRate).toFixed(4).toString()
      }

      this.logger.info({
        fn: 'calculateConversion',
        args: { amount, srcRate, destRate },
        result,
      })

      return result
    } catch (error) {
      this.logger.error({
        fn: 'calculateConversion',
        error,
        args: { amount, srcRateData, destRateData },
      })
      throw new ConvertCalculateError(error)
    }
  }

  /**
   * Conversion flow entry point.
   * @param  {String} amount           The amount to be converted.
   * @param  {String} date             The conversion rate date.
   * @param  {String} srcCurrency      The conversion source currency
   * @param  {String} destCurrency     The conversion destination currency.
   * @param  {Object} [extQueryRunner] The optional query runner.
   * @throws {ConvertError}            If some related operation fails.
   * @return {Promise<Number>}         The conversion result.
   */
  async convertAsync(amount, date, srcCurrency, destCurrency, extQueryRunner) {
    if (srcCurrency === destCurrency) {
      throw new SameCurrencyError()
    }
    try {
      const rates = await this.listRatesByDateAndPairAsync(date, srcCurrency, destCurrency, extQueryRunner)
      const [srcRate] = rates.filter(rate => rate.type === 'srcCurrency')
      const [destRate] = rates.filter(rate => rate.type === 'destCurrency')
      const result = this.calculateConversion(amount, srcRate, destRate)
      this.logger.info({
        fn: 'convertAsync',
        args: { date, srcCurrency, destCurrency },
        result,
      })
      return result
    } catch (error) {
      this.logger.error({
        fn: 'convertAsync',
        error,
        args: { date, srcCurrency, destCurrency },
      })
      throw new ConvertError(error)
    }
  }

  /**
   * List the rates in order to calculate the conversion.
   * @param  {String} date                 The conversion rate date.
   * @param  {String} srcCurrency          The conversion source currency
   * @param  {String} destCurrency         The conversion destination currency.
   * @param  {Object} extQueryRunner       The optional query runner.
   * @throws {ListRatesByDateAndPairError} If some related operation fails.
   * @return {Promise<Array>}              The list of rates.
   */
  async listRatesByDateAndPairAsync(date, srcCurrency, destCurrency, extQueryRunner) {
    try {
      const rates = await this.rateRepository
        .listRatesByDateAndPairAsync(date, srcCurrency, destCurrency, extQueryRunner)

      if (rates.length === 0) {
        throw new NotFoundError()
      }

      if (srcCurrency === 'EUR' || destCurrency === 'EUR') {
        rates.push({ date, rate: '1.00', ticker: 'EUR' })
      }

      if (rates.length !== 2) {
        throw new NumberOfRatesError()
      }

      const formattedRates = rates.map((currRate) => {
        return {
          date: currRate.date,
          rate: currRate.rate,
          ticker: currRate.ticker,
          type: currRate.ticker === srcCurrency
            ? 'srcCurrency'
            : 'destCurrency',
        }
      })

      this.logger.info({
        fn: 'listRatesByDateAndPairAsync',
        args: { date, srcCurrency, destCurrency },
        formattedRates,
      })

      return formattedRates
    } catch (error) {
      this.logger.error({
        fn: 'listRatesByDateAndPairAsync',
        error,
        args: { date, srcCurrency, destCurrency },
      })
      throw new ListRatesByDateAndPairError(error)
    }
  }
}

module.exports = ConverterService
