import 'env';
import './factories';
import chai from 'chai';
import MongoMemoryServer from 'mongodb-memory-server';

should = chai.should();

before(async function () {
	this.testDb = new MongoMemoryServer();

	process.env.NODE_ENV = 'test';
	process.env.CHIMERADB_PORT = await this.testDb.getPort();
	process.env.CHIMERADB_NAME = await this.testDb.getDbName();

	this.store = require('app/orm').default;
});

after(async function () {
	this.testDb.stop();
});
