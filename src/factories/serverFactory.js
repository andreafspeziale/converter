const express = require('express')

module.exports = {
  build: ({ converterRouter }) => {
    const app = express()

    const api = express.Router()
    app.use('/api', api)

    const v1 = express.Router()
    api.use('/v1', v1)

    v1.use('/convert', converterRouter)

    return app
  },
}
