-- CREATE DATABASE IF NO EXISTS evolvedb

SELECT 'CREATE DATABASE evolvedb'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'evolvedb')\gexec