module.exports = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'dev',
  password: 'secret_password',
  database: 'currency_conversion_data_dev',
  synchronize: false,
  logging: false,
  entities: [
    'src/orm/entity/**/*.js',
  ],
  migrations: [
    'src/orm/migration/**/*.ts',
  ],
  cli: {
    entitiesDir: 'src/orm/entity',
    migrationsDir: 'src/orm/migration',
  },
}
