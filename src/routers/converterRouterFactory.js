const { Router } = require('express')

module.exports = {
  build: ({ converterValidator, converterController }) => {
    const router = new Router()
    router.get('/', converterValidator.convert(), converterController.convert())
    return router
  },
}
