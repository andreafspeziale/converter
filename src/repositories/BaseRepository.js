const WithOptionalLogger = require('../helpers/WithOptionalLogger')

/**
 * Class representing a BaseRepository.
 */
class BaseRepository extends WithOptionalLogger {
  /**
   * Create a new instance.
   * @param  {Object<Object>} options.dbConnection The database connection.
   * @param  {Object<Object>} [options.logger]     The optional logger.
   * @throws {TypeError}                           If some required property is missing.
   * @return {BaseRepository}                      A new instance.
   */
  constructor({ dbConnection, logger }) {
    super({ logger })

    try {
      if (!dbConnection || typeof dbConnection !== 'object') {
        throw new TypeError(`Invalid "dbConnection" value: ${dbConnection}.`)
      }

      this.dbConnection = dbConnection
    } catch (err) {
      this.logger.error({ fn: 'constructor', args: { dbConnection, logger }, err })
      throw err
    }
  }

  /**
   * Find one or more entities by options.
   * @param  {Object}            findOptions      The find options.
   * @param  {Object}            logData          The data to log in case of exception.
   * @param  {Object}            [extQueryRunner] The optional query runner.
   * @return {Promise<Object[]>}                  The results.
   */
  async findAsync(findOptions, logData = {}, extQueryRunner) {
    let queryRunner
    try {
      queryRunner = extQueryRunner || await this.dbConnection.createQueryRunner()
      await queryRunner.connect()
      const results = await queryRunner.manager.getRepository(this.entity).find(findOptions)
      return Promise.resolve(results)
    } catch (err) {
      this.logger.error(Object.assign({}, logData, { err }))
      return Promise.reject(err)
    } finally {
      if (!extQueryRunner && queryRunner) {
        await queryRunner.release()
      }
    }
  }
}

module.exports = BaseRepository
