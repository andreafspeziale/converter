const { createConnection } = require('typeorm')

const loggerFactory = require('./factories/loggerFactory')
const serverFactory = require('./factories/serverFactory')

const RateRepository = require('./repositories/RateRepository')

const ConverterService = require('./services/ConverterService')
const ConverterController = require('./controllers/ConverterController')
const ConverterValidator = require('./validators/ConverterValidator')

const converterRouterFactory = require('./routers/converterRouterFactory');

(async () => {
  const logger = loggerFactory.build()

  // Connections to external services
  const dbConnection = await createConnection()

  // Repository
  const rateRepository = new RateRepository({ dbConnection, logger })

  // Services
  const converterService = new ConverterService({ rateRepository, logger })

  // Validators
  const converterValidator = new ConverterValidator()

  // Controllers
  const converterController = new ConverterController({ converterService, logger })

  // Routers
  const converterRouter = converterRouterFactory.build({ converterValidator, converterController })

  serverFactory
    .build({ converterRouter })
    .listen(3000, () => logger.info('API server is listening on port 3000.'))
})()
