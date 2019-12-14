module.exports = {
  type: 'postgres',
  host: `${process.env.POSTGRES_HOST}`,
  port: 5432,
  username: `${process.env.POSTGRES_USER}`,
  password: `${process.env.POSTGRES_PASSWORD}`,
  database: `${process.env.POSTGRES_DB}`,
  synchronize: false,
  logging: false,
  entities: [
    'src/orm/entity/**/*.js',
  ],
  migrations: [
    `src/orm/migration/**/*.${process.env.MIGRATION_EXTENSION}`,
  ],
  cli: {
    entitiesDir: 'src/orm/entity',
    migrationsDir: 'src/orm/migration',
  },
}
