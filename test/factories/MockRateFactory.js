const { Factory } = require('rosie')

const MockRateFactory = new Factory()
  .attrs(
    {
      date: new Date('2100-10-10'),
      rate: '1.23',
      ticker: 'USD',
    },
  )

module.exports = MockRateFactory
