/* eslint-env node, mocha */
const chai = require('chai')

const ConverterController = require('./ConverterController')

const { expect } = chai

describe('ConverterController (unit)', () => {
  describe('Constructor', () => {
    [{
      desc: 'a "converterService" instance is not provided',
      args: [{ converterService: undefined }],
      errorMessage: 'Invalid "converterService" value: undefined',
    }].forEach(test => it(`should throw if ${test.desc}`, () => {
      expect(() => new ConverterController(...test.args)).to.throw(TypeError, test.errorMessage)
    }))
  })
})
