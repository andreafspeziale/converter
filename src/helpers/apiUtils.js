const _ = require('lodash')

function getErrorResponse(error) {
  return { status: 'error', error: _.cloneDeep(error) }
}

function getSuccessResponse(data) {
  return { status: 'success', data: _.cloneDeep(data) }
}

module.exports = {
  getErrorResponse,
  getSuccessResponse,
}
