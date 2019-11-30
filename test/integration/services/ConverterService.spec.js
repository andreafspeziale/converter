/* eslint-env node, mocha */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const { createConnection } = require('typeorm')

const ConverterService = require('../../../src/services/ConverterService')
const ListRatesByDateAndPairError = require('../../../src/errors/ListRatesByDateAndPairError')
const RateEntity = require('../../../src/orm/entity/Rate')
const RateModel = require('../../../src/orm/model/Rate')
const RateRepository = require('../../../src/repositories/RateRepository')
const SameCurrencyError = require('../../../src/errors/SameCurrencyError')
const MockRateFactory = require('../../factories/MockRateFactory')

chai.use(chaiAsPromised)
const { expect } = chai

describe('ConverterService (integration)', () => {
  let dbConnection
  let queryRunner
  let rateRepository
  let converterService

  before(async () => {
    dbConnection = await createConnection()
    rateRepository = new RateRepository({ dbConnection })
    converterService = new ConverterService({ rateRepository })
  })

  beforeEach(async () => {
    queryRunner = dbConnection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
  })

  describe('listRatesByDateAndPairAsync()', () => {
    it('Should list the proper expected rates', async () => {
      const usdRates = new RateModel(MockRateFactory.build())
      const chfRates = new RateModel(MockRateFactory.build({ ticker: 'CHF' }))
      await queryRunner.manager.save(RateEntity, usdRates)
      await queryRunner.manager.save(RateEntity, chfRates)

      const result = await converterService
        .listRatesByDateAndPairAsync(usdRates.date, usdRates.ticker, chfRates.ticker, queryRunner)

      const rates = [usdRates, chfRates].map((currentRate) => {
        const { id, ...rate } = currentRate
        rate.type = currentRate.ticker === usdRates.ticker
          ? 'srcCurrency'
          : 'destCurrency'
        return rate
      })

      expect(rates).to.deep.equal(result)
    })

    it('Should list the proper expected rates', async () => {
      const usdRates = new RateModel(MockRateFactory.build())
      const eurRates = new RateModel(MockRateFactory.build({
        ticker: 'EUR',
        rate: '1.00',
      }))
      await queryRunner.manager.save(RateEntity, usdRates)

      const result = await converterService
        .listRatesByDateAndPairAsync(usdRates.date, usdRates.ticker, eurRates.ticker, queryRunner)

      const rates = [usdRates, eurRates].map((currentRate) => {
        const { id, ...rate } = currentRate
        rate.type = currentRate.ticker === usdRates.ticker
          ? 'srcCurrency'
          : 'destCurrency'
        return rate
      })

      expect(rates).to.deep.equal(result)
    })

    it('Should list the proper expected rates', async () => {
      const usdRates = new RateModel(MockRateFactory.build())
      const eurRates = new RateModel(MockRateFactory.build({
        ticker: 'EUR',
        rate: '1.00',
      }))
      await queryRunner.manager.save(RateEntity, usdRates)

      const result = await converterService
        .listRatesByDateAndPairAsync(usdRates.date, eurRates.ticker, usdRates.ticker, queryRunner)

      const rates = [usdRates, eurRates].map((currentRate) => {
        const { id, ...rate } = currentRate
        rate.type = currentRate.ticker === usdRates.ticker
          ? 'destCurrency'
          : 'srcCurrency'
        return rate
      })

      expect(rates).to.deep.equal(result)
    })

    it('Should raise ListRatesByDateAndPairError(NotFoundError)', () => {
      expect(converterService.listRatesByDateAndPairAsync(new Date('2019-10-10'), 'ZZZ', 'AAA', queryRunner))
        .to.be.rejectedWith(ListRatesByDateAndPairError, 'NotFoundError')
    })
    it('Should raise ListRatesByDateAndPairError(NumberOfRatesError)', async () => {
      const usdRates = new RateModel(MockRateFactory.build())
      const usdRates2 = new RateModel(MockRateFactory.build())
      const chfRates = new RateModel(MockRateFactory.build({ ticker: 'CHF' }))
      await queryRunner.manager.save(RateEntity, usdRates)
      await queryRunner.manager.save(RateEntity, usdRates2)
      await queryRunner.manager.save(RateEntity, chfRates)
      expect(converterService.listRatesByDateAndPairAsync(usdRates.date, usdRates.ticker, chfRates.ticker, queryRunner))
        .to.be.rejectedWith(ListRatesByDateAndPairError, 'NumberOfRatesError')
    })
  })

  describe('convertAsync()', () => {
    it('Should raise SameCurrencyError()', async () => {
      expect(converterService.convertAsync('5', new Date('2100-10-10'), 'USD', 'USD'))
        .to.be.rejectedWith(SameCurrencyError, '')
    })
    it('Should return the expected result', async () => {
      const expected = '5.0000'
      const usdRates = new RateModel(MockRateFactory.build())
      const chfRates = new RateModel(MockRateFactory.build({ ticker: 'CHF' }))
      await queryRunner.manager.save(RateEntity, usdRates)
      await queryRunner.manager.save(RateEntity, chfRates)

      const result = await converterService
        .convertAsync(expected, usdRates.date, usdRates.ticker, chfRates.ticker, queryRunner)

      expect(expected).to.deep.equal(result)
    })
  })

  afterEach(async () => {
    await queryRunner.rollbackTransaction()
    await queryRunner.release()
  })

  after(async () => {
    await dbConnection.close()
  })
})
