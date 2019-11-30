const BaseValidator = require('./BaseValidator')

/**
 * Class implementing the converter endpoint validator.
 * @extends {BaseValidator}
 */
class ConverterValidator extends BaseValidator {
  /**
   * Validate the convert endpoint params
   */
  convert() {
    return this.constructor.validateRequestWithSchema({
      reference_date: {
        optional: false,
        in: ['query'],
        ...this.schema.date,
      },
      amount: {
        optional: false,
        errorMessage: 'cacca',
        in: ['query'],
        ...this.schema.required,
        ...this.schema.currency,
      },
      src_currency: {
        optional: false,
        in: ['query'],
        ...this.schema.ticker,
      },
      dest_currency: {
        optional: false,
        in: ['query'],
        ...this.schema.ticker,
      },
    })
  }
}

module.exports = ConverterValidator
