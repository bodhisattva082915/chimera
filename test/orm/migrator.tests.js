import factory from 'factory-girl';
import sinon from 'sinon';
import ORM from 'chimera/orm/orm';
import Migrator from 'chimera/orm/migrator';

describe('Migrator', function () {
	before(async function () {
		this.orm = new ORM();
		await this.orm.init();

		this.Migrator = new Migrator(this.orm, { logging: false });
		this.Migration = this.orm.model('chimera.orm.migration');
		this.testModel = this.orm.model('tests.migrate.testModel', new this.orm.Schema({ data: String }));

		/**
         * Migration Dependency graph
         * Based on this dependency chain, migrations alpha and theta should be run first, then
         * migrations beta and gamma, then delta, then lastly iota.
         *  - alpha
         *    - beta
         *      - delta
         *        - iota (depends on both gamma and delta)
         *    - gamma
         *  - theta
         */
		this.makeOrderedMigrations = async (create = false) => {
			const op = create ? 'create' : 'build';
			const alpha = await factory[op]('chimera.orm.migrationTemplate', { name: 'alpha' });
			const beta = await factory[op]('chimera.orm.migrationTemplate', { name: 'beta', dependsOn: alpha.namespace });
			const delta = await factory[op]('chimera.orm.migrationTemplate', { name: 'delta', dependsOn: beta.namespace });
			const gamma = await factory[op]('chimera.orm.migrationTemplate', { name: 'gamma', dependsOn: alpha.namespace });
			const iota = await factory[op]('chimera.orm.migrationTemplate', { name: 'iota', dependsOn: [gamma.namespace, delta.namespace] });
			const theta = await factory[op]('chimera.orm.migrationTemplate', { name: 'theta' });

			return [alpha, beta, delta, gamma, iota, theta];
		};
	});

	after(async function () {
		await this.orm.disconnect();
	});

	beforeEach(function () {
		this.mockLoadMigrations = sinon.stub(this.Migrator, '_loadMigrations');
	});

	afterEach(async function () {
		this.mockLoadMigrations.restore();
		await this.Migration.deleteMany({});
	});

	it('should execute pending migration scripts', async function () {
		this.mockMigrations = (await factory.buildMany('chimera.orm.migrationTemplate', 3)).map(
			migration => migration.toJSON({ getters: true })
		);
		this.mockLoadMigrations.resolves(this.mockMigrations);

		const migrations = await this.Migrator.run();
		migrations.should.have.lengthOf(3);
		migrations.forEach(tracked => this.mockMigrations.map(migration => migration.namespace).should.include(tracked.namespace));

		const noResults = await this.Migrator.run();
		noResults.should.have.lengthOf(0);

		const additionalMigration = await factory.build('chimera.orm.migrationTemplate', { namespace: 'chimera.module.migrationIota' });
		this.mockLoadMigrations.resolves([...this.mockMigrations, additionalMigration.toJSON({ getters: true })]);
		const onlyOneResult = await this.Migrator.run();
		onlyOneResult.should.have.lengthOf(1);
		onlyOneResult[0].namespace.should.equal(additionalMigration.namespace);
	});

	it('should execute pending migration scripts, ordered by `dependsOn`', async function () {
		this.mockMigrations = (await this.makeOrderedMigrations()).map(migration => {
			migration = migration.toJSON({ getters: true });
			return migration;
		});
		this.mockLoadMigrations.resolves(this.mockMigrations);

		const executionOrder = ['alpha', 'theta', 'beta', 'gamma', 'delta', 'iota'];
		const executed = await this.Migrator.run();
		executed.should.have.lengthOf(this.mockMigrations.length);
		executed.every((e, i) => executionOrder[i] === e.name).should.be.true;
	});

	it('should reverse migration scripts', async function () {
		this.mockMigrations = (await factory.createMany('chimera.orm.migrationTemplate', 5)).map(
			migration => migration.toJSON({ getters: true })
		);
		this.mockLoadMigrations.resolves(this.mockMigrations);

		const reversed = await this.Migrator.run({ backwards: true });
		reversed.should.have.lengthOf(5);
		reversed.forEach(reverse => this.mockMigrations.map(migration => migration.namespace).should.include(reverse.namespace));
		(await this.Migration.countDocuments()).should.equal(0);
	});

	it('should reverse migration scripts, ordered by `dependsOn`', async function () {
		this.mockMigrations = (await this.makeOrderedMigrations(true)).map(migration => {
			migration = migration.toJSON({ getters: true });
			return migration;
		});
		this.mockLoadMigrations.resolves(this.mockMigrations);

		const reversedOrder = ['iota', 'theta', 'delta', 'gamma', 'beta', 'alpha'];
		const reversed = await this.Migrator.run({ backwards: true });
		reversed.should.have.lengthOf(this.mockMigrations.length);
		reversed.every((e, i) => reversedOrder[i] === e.name).should.be.true;
	});

	// it('should execute migrations within an atomic transaction', async function () {
	// 	this.mockMigrationSuccess = await factory.build('chimera.orm.migrationTemplate', { namespace: 'test.migrate.success' });
	// 	this.mockMigrationSuccess.forwards = async () => {
	// 		await this.testModel.create([
	// 			{ data: 'This should persist' },
	// 			{ data: 'This should also persist' }
	// 		]);
	// 	};
	// 	this.mockMigrationFailure = await factory.build('chimera.orm.migrationTemplate', { namespace: 'test.migrate.failure' });
	// 	this.mockMigrationFailure.forwards = async () => {
	// 		await this.testModel.create([
	// 			{ data: 'This should get rolled back' },
	// 			{ data: 'This should also get rolled back' }
	// 		]);
	// 		throw new Error('Uh oh... Something went wrong');
	// 	};
	// 	this.mockLoadMigrations.resolves([this.mockMigrationSuccess, this.mockMigrationFailure]);

	// 	const executed = await this.Migrator.run({ });
	// 	const documents = await this.testModel.countDocuments();
	// 	console.log(documents);
	// });
});
