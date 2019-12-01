const { createConnection } = require('typeorm')
const fs = require('fs')
const path = require('path')
const xmlConverter = require('xml-js')

const RateEntity = require('../src/orm/entity/Rate')
const RateModel = require('../src/orm/model/Rate')

const loggerFactory = require('../src/factories/loggerFactory');

(async () => {
  const logger = loggerFactory.build()
  try {
    logger.info('Populating the DB...')
    const xml = fs.readFileSync(path.resolve('data', 'data.xml'), 'utf8')
    const data = xmlConverter.xml2js(xml, { ignoreComment: true, ignoreDeclaration: true })
    const { elements } = data.elements[0].elements[2]

    const datesWithCurrencyRates = elements.reduce((acc, item) => {
      const date = item.attributes.time
      const rates = item.elements.map((el) => {
        const { type, name, ...pair } = el
        return { ...pair.attributes }
      })
      return acc.concat({ date, rates })
    }, [])

    const dbConnection = await createConnection()
    const queryRunner = dbConnection.createQueryRunner()
    await queryRunner.connect()

    const result = await queryRunner.manager.getRepository(RateEntity).find({ id: 1 })
    if (!result.length) {
      logger.info('Inserting data...')
      await queryRunner.startTransaction()
      const insertions = datesWithCurrencyRates.reduce((acc, item) => {
        const promises = item.rates.map((current) => {
          const rate = new RateModel({ date: item.date, ticker: current.currency, rate: current.rate })
          return queryRunner.manager.save(RateEntity, rate)
        })
        return acc.concat(promises)
      }, [])
      await Promise.all(insertions)
      await queryRunner.commitTransaction()
    } else {
      logger.info('Data already inserted')
    }

    await queryRunner.release()
    await dbConnection.close()
    logger.info('Finished.')
  } catch (error) {
    logger.error(error)
    process.exit(1)
  }
})()
