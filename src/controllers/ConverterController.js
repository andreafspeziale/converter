const { getErrorResponse, getSuccessResponse } = require('../helpers/apiUtils')
const WithOptionalLogger = require('../helpers/WithOptionalLogger')

/**
 * Class implementing the currency converter controller.
 * @extends {WithOptionalLogger}
 */
class ConverterController extends WithOptionalLogger {
  /**
   * Create a new instance.
   * @param  {Object} options.converterService The ConverterService instance.
   * @param  {Object} [options.logger]         The logger instance.
   * @throws {TypeError}                       If some required property is missing.
   * @return {ConverterController}             A new instance.
   */
  constructor({ converterService, logger }) {
    super({ logger })

    if (!converterService || typeof converterService !== 'object') {
      throw new TypeError(`Invalid "converterService" value: ${converterService}.`)
    }

    this.converterService = converterService
  }

  convert() {
    return [
      async (req, res) => {
        try {
          const {
            amount,
            src_currency: srcCurrency,
            dest_currency: destCurrency,
            reference_date: date,
          } = req.query
          this.logger.info({
            amount,
            srcCurrency,
            destCurrency,
            date,
          })
          const result = await this.converterService.convertAsync(amount, date, srcCurrency, destCurrency)
          res.status(200).json(getSuccessResponse({ amount: result, currency: destCurrency }))
        } catch (error) {
          this.logger.error({ req, error })
          res.status(500).json(getErrorResponse('Internal server error.'))
        }
      },
    ]
  }
}

module.exports = ConverterController
