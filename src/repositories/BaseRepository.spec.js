/* eslint-env node, mocha */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

const BaseRepository = require('./BaseRepository')
const MockDbConnection = require('../../test/mocks/MockDbConnection')

chai.use(chaiAsPromised)
const { expect } = chai

describe('BaseRepository (unit)', () => {
  describe('Constructor', () => {
    [{
      desc: 'a "dbConnection" is not provided',
      args: [{ dbConnection: undefined }],
      errorMessage: 'Invalid "dbConnection" value: undefined',
    }].forEach(test => it(`should throw if ${test.desc}`, () => {
      expect(() => new BaseRepository(...test.args)).to.throw(TypeError, test.errorMessage)
    }))
  })
  describe('functionalities', () => {
    it('Should reject with Error', () => {
      const responses = {
        connectMethodResponse: {},
        findResponse: Promise.reject(new Error()),
        releaseResponse: {},
      }
      const dbConnection = new MockDbConnection({ ...responses })
      const baseRepository = new BaseRepository({ ...dbConnection })
      expect(baseRepository.findAsync({}, {}))
        .to.be.rejectedWith(Error)
    })
  })
})
