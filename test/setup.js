import 'env';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiHttp from 'chai-http';
import chaiSubset from 'chai-subset';
import chaiSinon from 'chai-sinon';
import MongoMemoryServer from 'mongodb-memory-server';
import MailDev from 'maildev';
import mongoose from 'mongoose';
import uuidv4 from 'uuid/v4';

chai.use(chaiSubset);
chai.use(chaiAsPromised);
chai.use(chaiSinon);
chai.use(chaiHttp);

should = chai.should();

before(async function () {
	this.testDb = new MongoMemoryServer();
	this.testSMTPCreds = { username: 'support@domain.com', password: uuidv4() };
	this.testSMTP = new MailDev({
		smtp: 587,
		silent: true,
		incomingUser: this.testSMTPCreds.username,
		incomingPass: this.testSMTPCreds.password
	});

	process.env.NODE_ENV = 'test';
	process.env.CHIMERADB_PORT = await this.testDb.getPort();
	process.env.CHIMERADB_NAME = await this.testDb.getDbName();
	process.env.CHIMERASMTP_HOST = 'localhost';
	process.env.CHIMERASMTP_PORT = this.testSMTP.port;
	process.env.CHIMERASMTP_USERNAME = this.testSMTPCreds.username;
	process.env.CHIMERASMTP_PASSWORD = this.testSMTPCreds.password;

	await (await import('chimera/orm')).default.init(); // Init basic ORM
	await import('chimera/smtp'); // Init SMTP transport
	await import('chimera/app'); // Init express configuration

	await import('./_factories');
});

after(async function () {
	await mongoose.disconnect();
	this.testDb.stop();
	this.testSMTP.close();
});
