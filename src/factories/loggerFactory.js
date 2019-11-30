const bunyan = require('bunyan')
const pJSON = require('../../package.json')

module.exports = {
  build: (level = 'debug') => bunyan.createLogger({
    level,
    name: pJSON.name,
    serializers: bunyan.stdSerializers,
  }),
}
