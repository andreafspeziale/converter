const { checkSchema, validationResult } = require('express-validator')
const { getErrorResponse } = require('../helpers/apiUtils')
/**
 * Class implementing the base validator.
 */
class BaseValidator {
  /**
   * Create a new instance.
   * @return {ConverterController} A new instance.
   */
  constructor() {
    this.schema = {
      date: {
        isISO8601: true,
        toDate: true,
        errorMessage: 'Invalid Date.',
      },
      currency: {
        isCurrency: {
          options: { allow_negatives: false, digits_after_decimal: [1, 2, 3, 4] },
        },
        errorMessage: 'Must be a positive float with . as decimal separator and max four decimals.',
      },
      ticker: {
        isAlpha: true,
        isUppercase: true,
        isLength: { options: { min: 3, max: 3 }, errorMessage: 'Must contain three letters.' },
        errorMessage: 'Must contains only letters (A-Z).',
      },
    }
  }

  /**
   * Validate and return eventually errors or jump to the next middleware.
   * @param  {Object} schema The validation schema.
   */
  static validateRequestWithSchema(schema) {
    return [
      ...checkSchema(schema),
      (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
          return res.status(400).json(getErrorResponse({ code: 400, ...errors }))
        }
        return next()
      },
    ]
  }
}

module.exports = BaseValidator
