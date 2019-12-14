export MIGRATION_EXTENSION=ts
npm run db:migration:run
export MIGRATION_EXTENSION=js
npm run populate
npm run start