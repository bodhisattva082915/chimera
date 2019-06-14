import 'env';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiHttp from 'chai-http';
import chaiSubset from 'chai-subset';
import chaiSinon from 'chai-sinon';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import MailDev from 'maildev';
import uuidv4 from 'uuid/v4';
import app from 'chimera/app';
import { sleep } from './utils';

chai.use(chaiSubset);
chai.use(chaiAsPromised);
chai.use(chaiSinon);
chai.use(chaiHttp);

should = chai.should();

before(async function () {
	this.app = app;
	this.testDb = await (async function () {
		const replSet = new MongoMemoryReplSet({
			instanceOpts: [
				{
					storageEngine: 'wiredTiger'
				}
			]
		});
		await replSet.waitUntilRunning();
		return replSet;
	})();
	this.testPrimaryNode = this.testDb.servers[0];
	this.testSMTPCreds = { username: 'support@domain.com', password: uuidv4() };
	this.testSMTP = new MailDev({
		smtp: 587,
		silent: true,
		incomingUser: this.testSMTPCreds.username,
		incomingPass: this.testSMTPCreds.password
	});

	process.env.NODE_ENV = 'test';
	process.env.CHIMERADB_PORT = await this.testPrimaryNode.getPort();
	process.env.CHIMERADB_NAME = await this.testDb.getDbName();
	process.env.CHIMERARS_NAME = 'testset';
	process.env.CHIMERASMTP_HOST = 'localhost';
	process.env.CHIMERASMTP_PORT = this.testSMTP.port;
	process.env.CHIMERASMTP_USERNAME = this.testSMTPCreds.username;
	process.env.CHIMERASMTP_PASSWORD = this.testSMTPCreds.password;

	await sleep(2000); // Replica set needs a bit more time to perform elections even though it is running...
	await this.app.init();
	await import('./_factories'); // Init factories
});

after(async function () {
	await this.app.orm.disconnect();
	this.testDb.stop();
	this.testSMTP.close();
});
