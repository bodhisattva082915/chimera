import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { ORM } from 'chimera/orm';

/**
 * Transactions are currently only supported for mongodb replica sets. This plugin spins up
 * a transaction compatible in-memory mongodb replica set and initializes a new ORM to interface
 * with the replica set.
 */
module.exports = function withTransaction () {
	const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms));
	return this.extend('with transactional support', {
		before: async function () {
			if (!this._replSet) {
				this._replSet = await (async function () {
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
				this._replSetPrimary = this._replSet.servers[0];
				await sleep(2000); // Replica set needs a bit more time to perform elections even though it is running...
			}

			if (!this.txnORM) {
				const port = await this._replSetPrimary.getPort();
				const dbName = await this._replSet.getDbName();
				const rsName = 'testset';

				this.txnORM = new ORM();
				await this.txnORM.connect(`mongodb://localhost:${port}/${dbName}?replicaSet=${rsName}`, {
					useNewUrlParser: true,
					useCreateIndex: true,
					autoReconnect: true,
					reconnectTries: 30
				});
			}
		},
		after: async function () {
			await this.txnORM.disconnect();
			await this._replSet.stop();
		}
	});
};
