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
