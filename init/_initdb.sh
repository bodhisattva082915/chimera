#!/bin/bash
set -e

##
# Initializes an empty databse by creating a blank collection. See mongodb docs on
# database creation. Sets values dynamically using env variables. See github link
# about strategy details.
# https://docs.mongodb.com/manual/core/databases-and-collections/#create-a-database
# https://github.com/docker-library/mongo/issues/257#issuecomment-375747688
## 

mongo <<EOF
use $CHIMERADB_NAME
db.initdb.insert({
    initialized_at: new Date()
})
db.createUser({
    user: '$CHIMERADB_USERNAME',
    pwd: '$CHIMERADB_PASSWORD',
    roles: [
        { 
            role: "readWrite", 
            db: '$CHIMERADB_NAME'
        }
    ]
})
EOF