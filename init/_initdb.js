/**
 * Initializes an empty databse by creating a blank collection. See mongodb docs on
 * database creation.
 * https://docs.mongodb.com/manual/core/databases-and-collections/#create-a-database
 */
db.createCollection('_initdb');
db.createUser({
    user: "chimeraAdmin", // TODO: Set by env
    pwd: "chimeraSecret", // TODO: Set by env
    roles: [
        { 
            role: "readWrite", 
            db: "chimera" // TODO: Allow name override by env
        }
    ]
})