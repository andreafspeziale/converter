class MockDbConnection {
  constructor({ connectMethodResponse, findResponse, releaseResponse }) {
    this.dbConnection = {
      createQueryRunner: async () => {
        return {
          connect: async () => connectMethodResponse,
          manager: {
            getRepository: () => {
              return { find: async () => findResponse }
            },
          },
          release: async () => releaseResponse,
        }
      },
    }
  }
}

module.exports = MockDbConnection
