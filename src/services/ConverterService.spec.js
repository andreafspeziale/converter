/* eslint-env node, mocha */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const sinon = require('sinon')

const ConverterService = require('./ConverterService')
const ConvertError = require('../errors/ConvertError')
const ConvertCalculateError = require('../errors/ConvertCalculateError')
const ListRatesByDateAndPairError = require('../errors/ListRatesByDateAndPairError')
const NotFoundError = require('../errors/NotFoundError')
const RateRepository = require('../repositories/RateRepository')
const RateModel = require('../orm/model/Rate')
const SameCurrencyError = require('../errors/SameCurrencyError')
const MockRateFactory = require('../../test/factories/MockRateFactory')

chai.use(chaiAsPromised)
const { expect } = chai

describe('ConverterService (unit)', () => {
  describe('Constructor', () => {
    [{
      desc: 'a "RateRepository" instance is not provided',
      args: [{ rateRepository: undefined }],
      errorMessage: 'Invalid "rateRepository" value: undefined',
    }].forEach(test => it(`should throw if ${test.desc}`, () => {
      expect(() => new ConverterService(...test.args)).to.throw(TypeError, test.errorMessage)
    }))
  })
  describe('Functionalities', () => {
    const dbConnection = {}
    let converterService
    let rateRepository
    before(async () => {
      rateRepository = new RateRepository({ dbConnection })
      converterService = new ConverterService({ rateRepository })
    })
    describe('calculateConversion()', () => {
      it('Should calculate the correct rate', () => {
        const expected = '5.0000'
        const usdRates = new RateModel(MockRateFactory.build())
        const chfRates = new RateModel(MockRateFactory.build({ ticker: 'CHF' }))
        const rates = [usdRates, chfRates].map((currentRate) => {
          const { id, ...rate } = currentRate
          rate.type = currentRate.ticker === usdRates.ticker
            ? 'srcCurrency'
            : 'destCurrency'
          return rate
        })
        const result = converterService
          .calculateConversion(expected, rates[0], rates[1])
        expect(expected).to.deep.equal(result)
      })
      it('Should calculate the correct rate with EUR as destRate', () => {
        const amount = '5.0000'
        const usdRates = new RateModel(MockRateFactory.build())
        const eurRates = new RateModel(MockRateFactory.build({ ticker: 'EUR', rate: '1.00' }))
        const expected = (parseFloat(amount) / parseFloat(usdRates.rate))
          .toFixed(4)
          .toString()
        const rates = [usdRates, eurRates].map((currentRate) => {
          const { id, ...rate } = currentRate
          rate.type = currentRate.ticker === usdRates.ticker
            ? 'srcCurrency'
            : 'destCurrency'
          return rate
        })
        const result = converterService
          .calculateConversion(amount, rates[0], rates[1])
        expect(expected).to.deep.equal(result)
      })
      it('Should calculate the correct rate with EUR as srcRate', () => {
        const amount = '5.0000'
        const usdRates = new RateModel(MockRateFactory.build())
        const eurRates = new RateModel(MockRateFactory.build({ ticker: 'EUR', rate: '1.00' }))
        const expected = (parseFloat(amount) * parseFloat(usdRates.rate))
          .toFixed(4)
          .toString()
        const rates = [eurRates, usdRates].map((currentRate) => {
          const { id, ...rate } = currentRate
          rate.type = currentRate.ticker === eurRates.ticker
            ? 'srcCurrency'
            : 'destCurrency'
          return rate
        })
        const result = converterService
          .calculateConversion(amount, rates[0], rates[1])
        expect(expected).to.deep.equal(result)
      })
      it('Should raise ConvertCalculateError()', () => {
        const badAmount = 'test'
        const usdRates = new RateModel(MockRateFactory.build())
        const chfRates = new RateModel(MockRateFactory.build({ ticker: 'CHF' }))
        const rates = [usdRates, chfRates].map((currentRate) => {
          const { id, ...rate } = currentRate
          rate.type = currentRate.ticker === usdRates.ticker
            ? 'srcCurrency'
            : 'destCurrency'
          return rate
        })

        expect(() => converterService.calculateConversion(badAmount, rates[0], rates[1]))
          .to.throw(ConvertCalculateError)
      })
    })
    describe('convertAsync()', () => {
      it('Should raise SameCurrencyError()', () => {
        expect(converterService.convertAsync('5.0000', new Date(), 'USD', 'USD'))
          .to.be.rejectedWith(SameCurrencyError)
      })
      it('Should raise ConvertError()', () => {
        sinon.stub(converterService, 'listRatesByDateAndPairAsync').throws(new NotFoundError())
        expect(converterService.convertAsync('5.0000', new Date(), 'USD', 'CHF'))
          .to.be.rejectedWith(ConvertError)
      })
      it('Should return the expected value', async () => {
        const expected = '5.0000'
        const usdRates = new RateModel(MockRateFactory.build())
        const chfRates = new RateModel(MockRateFactory.build({ ticker: 'CHF' }))
        sinon.stub(rateRepository, 'listRatesByDateAndPairAsync').returns([usdRates, chfRates])
        const result = await converterService.convertAsync(expected, usdRates.date, usdRates.ticker, chfRates.ticker)
        expect(result).to.deep.equal(expected)
      })
    })
    describe('listRatesByDateAndPairAsync()', () => {
      it('Should raise ListRatesByDateAndPairError(NotFoundError)', () => {
        sinon.stub(rateRepository, 'listRatesByDateAndPairAsync').returns([])
        expect(converterService.listRatesByDateAndPairAsync('5.0000', new Date(), 'USD', 'CHF'))
          .to.be.rejectedWith(ListRatesByDateAndPairError, 'NotFoundError')
      })
      it('Should raise ListRatesByDateAndPairError(NumberOfRatesError)', () => {
        const usdRates = new RateModel(MockRateFactory.build())
        const usdRates2 = new RateModel(MockRateFactory.build())
        const chfRates = new RateModel(MockRateFactory.build({ ticker: 'CHF' }))
        sinon.stub(rateRepository, 'listRatesByDateAndPairAsync')
          .returns([usdRates, usdRates2, chfRates])
        expect(converterService.listRatesByDateAndPairAsync('5.0000', new Date(), 'USD', 'CHF'))
          .to.be.rejectedWith(ListRatesByDateAndPairError, 'NumberOfRatesError')
      })
      it('Should return the expected result', async () => {
        const usdRates = new RateModel(MockRateFactory.build())
        const chfRates = new RateModel(MockRateFactory.build({ ticker: 'CHF' }))
        sinon.stub(rateRepository, 'listRatesByDateAndPairAsync').returns([usdRates, chfRates])
        const rates = [usdRates, chfRates].map((currentRate) => {
          const { id, ...rate } = currentRate
          rate.type = currentRate.ticker === usdRates.ticker
            ? 'srcCurrency'
            : 'destCurrency'
          return rate
        })

        const result = await converterService
          .listRatesByDateAndPairAsync(usdRates.date, usdRates.ticker, chfRates.ticker)
        expect(rates).to.deep.equal(result)
      })
    })
    afterEach(async () => {
      sinon.restore()
    })
  })
})
