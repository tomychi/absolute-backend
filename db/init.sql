-- CREATE DATABASE IF NO EXISTS absolutedb

SELECT 'CREATE DATABASE absolutedb'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'absolutedb')\gexec
