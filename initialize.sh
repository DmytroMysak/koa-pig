#!/usr/bin/env bash
sudo apt-get install mplayer expect postgresql-client postgresql postgresql-contrib;

db_password="littlePig" # PASSWORD TO USER DB

/usr/bin/expect <<EOF
sudo -u postgres createuser -D -A -P littlePig;
expect "Enter password for new role: ";
send "$db_password";
expect "Enter it again: "
send "$db_password"
interact
EOF
sudo -u postgres createdb -O littlePig little_pig;

sudo su - postgres <<EOF
psql little_pig;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\q
exit;
EOF

touch .env;
echo -e "AWS_ACCESS_KEY_ID=<YOUR AWS accessKeyId>
AWS_SECRET_ACCESS_KEY=<YOUR AWS secretAccessKey>
AWS_REGION=eu-west-1
DB_NAME=little_pig
DB_USER=littlePig
DB_PASSWORD=$db_password
DB_HOST=localhost
DB_PORT=5432" > .env;

yarn;
