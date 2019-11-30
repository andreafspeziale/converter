function getReq({
  headers = {}, params = {}, query = {}, originalUrl = '',
} = {}) {
  return {
    header(h) {
      return this.headers[h.toLowerCase()]
    },
    headers,
    params,
    query,
    originalUrl,
  }
}

function getRes() {
  return {
    status(code) {
      const self = this
      self.statusCode = code
      return {
        json(json) {
          self.body = json
        },
      }
    },
  }
}

async function executeMiddlewaresChain(chain, req, res) {
  for (let i = 0; i < chain.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await chain[i](req, res, () => {})
  }
}

module.exports = {
  executeMiddlewaresChain,
  getReq,
  getRes,
}
