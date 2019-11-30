/* eslint-env node, mocha */
const chai = require('chai')
const { createConnection } = require('typeorm')
const sinon = require('sinon')

const ConverterService = require('../../../src/services/ConverterService')
const ConverterController = require('../../../src/controllers/ConverterController')
const RateModel = require('../../../src/orm/model/Rate')
const RateRepository = require('../../../src/repositories/RateRepository')
const MockRateFactory = require('../../factories/MockRateFactory')
const testUtils = require('../../testUtils')

const { expect } = chai

describe('ConverterController (integration)', () => {
  let dbConnection
  let rateRepository
  let converterService
  let converterController

  before(async () => {
    dbConnection = await createConnection()
    rateRepository = new RateRepository({ dbConnection })
    converterService = new ConverterService({ rateRepository })
    converterController = new ConverterController({ converterService })
  })

  describe('convert()', () => {
    it('Should properly convert', async () => {
      const amount = '5.0000'
      const usdRates = new RateModel(MockRateFactory.build())
      sinon.stub(rateRepository, 'listRatesByDateAndPairAsync').returns([usdRates])
      const expectedBody = {
        status: 'success',
        data: {
          amount: (parseFloat(amount) / parseFloat(usdRates.rate)).toFixed(4).toString(),
          currency: 'EUR',
        },
      }
      const req = testUtils.getReq({
        originalUrl: '/api/v1/convert',
        query: {
          amount,
          src_currency: usdRates.ticker,
          dest_currency: 'EUR',
          reference_date: usdRates.date,
        },
      })
      const res = testUtils.getRes()
      await testUtils.executeMiddlewaresChain(converterController.convert(), req, res)
      expect(res.statusCode).to.equal(200)
      expect(res.body).to.deep.equal(expectedBody)
    })
    it('Should return error 500 since no list rate result', async () => {
      const amount = '5.0000'
      const someRate = new RateModel(MockRateFactory.build({ ticker: 'XXX' }))
      const expectedBody = {
        status: 'error',
        error: 'Internal server error.',
      }
      const req = testUtils.getReq({
        originalUrl: '/api/v1/convert',
        query: {
          amount,
          src_currency: someRate.ticker,
          dest_currency: 'EUR',
          reference_date: someRate.date,
        },
      })
      const res = testUtils.getRes()
      await testUtils.executeMiddlewaresChain(converterController.convert(), req, res)
      expect(res.statusCode).to.equal(500)
      expect(res.body).to.deep.equal(expectedBody)
    })
  })

  afterEach(async () => {
    sinon.restore()
  })
  after(async () => {
    await dbConnection.close()
  })
})
