# Converter
API endpoint for currency conversion.

## Requirements
- Docker

## Quickstart
- `$ docker-compose up`

Go to the browser and try:

`http://localhost:3000/api/v1/convert?amount=5&src_currency=USD&dest_currency=CHF&reference_date=2019-11-22`


## Test
- `$ docker exec -it converter_app_1 /bin/bash`
- `$ npm run test`