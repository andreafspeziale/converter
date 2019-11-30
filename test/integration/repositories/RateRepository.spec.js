/* eslint-env node, mocha */
const chai = require('chai')
const { createConnection } = require('typeorm')

const RateEntity = require('../../../src/orm/entity/Rate')
const RateModel = require('../../../src/orm/model/Rate')
const RateRepository = require('../../../src/repositories/RateRepository')
const MockRateFactory = require('../../factories/MockRateFactory')

const { expect } = chai

describe('RateRepository (integration)', () => {
  let dbConnection
  let queryRunner
  let rateRepository

  before(async () => {
    dbConnection = await createConnection()
    rateRepository = new RateRepository({ dbConnection })
  })

  beforeEach(async () => {
    queryRunner = dbConnection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
  })

  it('Should list the proper expected rates', async () => {
    const usdRates = new RateModel(MockRateFactory.build())
    const chfRates = new RateModel(MockRateFactory.build({ ticker: 'CHF' }))
    await queryRunner.manager.save(RateEntity, usdRates)
    await queryRunner.manager.save(RateEntity, chfRates)

    const result = await rateRepository
      .listRatesByDateAndPairAsync(usdRates.date, usdRates.ticker, chfRates.ticker, queryRunner)

    expect([usdRates, chfRates]).to.deep.equal(result)
  })

  it('Should not list any rate', async () => {
    const result = await rateRepository
      .listRatesByDateAndPairAsync(new Date('2100-11-11'), 'USD', 'CHF', queryRunner)

    expect([]).to.deep.equal(result)
  })

  it('Should not list any rate', async () => {
    const result = await rateRepository
      .listRatesByDateAndPairAsync(new Date('2019-10-10'), 'ZZZ', 'AAA', queryRunner)

    expect([]).to.deep.equal(result)
  })

  afterEach(async () => {
    await queryRunner.rollbackTransaction()
    await queryRunner.release()
  })

  after(async () => {
    await dbConnection.close()
  })
})
