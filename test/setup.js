import 'env';
import chai from 'chai';
import chaiAsPromised from "chai-as-promised";
import chaiSubset from "chai-subset";
import MongoMemoryServer from 'mongodb-memory-server';
import mongoose from "mongoose";

chai.use(chaiSubset);
chai.use(chaiAsPromised);

should = chai.should();

before(async function () {
	this.testDb = new MongoMemoryServer();

	process.env.NODE_ENV = 'test';
	process.env.CHIMERADB_PORT = await this.testDb.getPort();
	process.env.CHIMERADB_NAME = await this.testDb.getDbName();

	await require('app/db');
	await require('app/orm');

	await require('./factories');
});

after(async function () {
	await mongoose.disconnect();
	this.testDb.stop();
});