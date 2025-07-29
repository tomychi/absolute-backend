## migrations
npm run m:gen -- src/migrations/init
npm run m:run
npm run schema:drop


## Auth module
nest g mo modules/auth
nest g s modules/auth/services/auth --flat --no-spec
nest g co modules/auth/controllers/auth --flat --no-spec

## Users module
nest g mo modules/users
nest g s modules/users/services/users --flat --no-spec
nest g co modules/users/controllers/users --flat --no-spec

## Company module
nest g mo modules/companies
nest g s modules/companies/services/companies --flat --no-spec
nest g co modules/companies/controllers/companies --flat --no-spec


## Branch module
nest g mo modules/branches
nest g s modules/branches/services/branches --flat --no-spec
nest g co modules/branches/controllers/branches --flat --no-spec

## Product module
nest g mo modules/products
nest g s modules/products/services/products --flat --no-spec
nest g co modules/products/controllers/products --flat --no-spec

## Inventory module
nest g mo modules/inventory
nest g s modules/inventory/services/inventory --flat --no-spec
nest g co modules/inventory/controllers/inventory --flat --no-spec

nest g s modules/inventory/services/stock-movements --flat --no-spec

nest g s modules/inventory/services/stock-transfers --flat --no-spec

nest g co modules/inventory/controllers/stock-movements --flat --no-spec
nest g co modules/inventory/controllers/stock-transfers --flat --no-spec
