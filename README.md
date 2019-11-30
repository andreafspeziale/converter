# Converter
API endpoint for currency conversion.

## Quickstart
- `$ npm i`
- `$ cp ormconfig.template.js ormconfig.js`
- `$ docker-compose up`

As soon as the db is ready to accept connections open a new terminal and:
- `$ npm run db:migration:run`
- Update the `ormconfig.js` changing the following code from this
```
"migrations": [
    "src/orm/migration/**/*.ts"
  ],
```
to this:
```
"migrations": [
    "src/orm/migration/**/*.js"
  ],
```
- `$ npm run populate`
- `$ npm run start`

Go to the browser and try:

`http://localhost:3000/api/v1/convert?amount=5&src_currency=USD&dest_currency=CHF&reference_date=2019-11-22`


## Test
- `$ npm run test`

The above command will create a `coverage` folder containing an `index.html` which will show on your favorite browser the test coverage of the project.