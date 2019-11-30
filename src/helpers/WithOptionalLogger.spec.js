/* eslint-env node, mocha */
const { expect } = require('chai')

const WithOptionalLogger = require('./WithOptionalLogger')

describe('WithOptionalLogger (unit)', () => {
  describe('constructor', () => {
    it('should throw a TypeError if logger is present and not an object', () => {
      expect(() => new WithOptionalLogger({ logger: 'i_am_a_string' }))
        .to.throw(TypeError, 'Invalid "logger" value: i_am_a_string.')
    });
    [{
      expect: undefined,
      level: 'debug',
      logger: undefined,
    },
    {
      expect: undefined,
      level: 'error',
      logger: undefined,
    },
    {
      expect: undefined,
      level: 'info',
      logger: undefined,
    },
    {
      expect: undefined,
      level: 'trace',
      logger: undefined,
    },
    {
      expect: undefined,
      level: 'warn',
      logger: undefined,
    }].forEach(test => it(`should return ${test.expect} since logger is ${test.logger} and level is ${test.level}`, () => {
      const log = new WithOptionalLogger({ logger: test.logger })
      const result = log.logger[test.level]()
      expect(result).to.deep.equal(test.expect)
    }))
  })
})
