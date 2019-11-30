const { EntitySchema } = require('typeorm')

const Rate = require('../model/Rate')

module.exports = new EntitySchema({
  name: 'Rate',
  target: Rate,
  columns: {
    id: {
      primary: true,
      type: 'bigint',
      generated: true,
    },
    date: {
      type: 'timestamp with time zone',
    },
    rate: {
      type: 'text',
    },
    ticker: {
      type: 'varchar',
      length: 3,
    },
  },
})
