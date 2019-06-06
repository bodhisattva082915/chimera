import factory from 'factory-girl';
import sinon from 'sinon';
import ORM from 'chimera/orm/orm';

describe('ORM', function () {
	before(async function () {
		this.orm = new ORM();
		await this.orm.init();

		this.staticModels = [
			'chimera.orm.model',
			'chimera.orm.field',
			'chimera.orm.association'
		];

		this.dynamicModels = await factory.createMany('chimera.orm.model', 3);

		for (const model of this.dynamicModels) {
			await factory.createMany('chimera.orm.field', 3, {
				chimeraModelId: model.id
			});
		}
	});

	after(async function () {
		await factory.cleanUp();
		await this.orm.disconnect();
	});

	describe('_loadStaticSchemas', function () {
		it('should register statically defined schemas', async function () {
			await this.orm._loadStaticSchemas();

			this.orm._registry.should.include.keys(this.staticModels);
		});
	});

	describe('_loadDynamicSchemas', function () {
		it('should register dynamically defined schemas', async function () {
			await this.orm._loadDynamicSchemas();

			this.orm._registry.should.include.keys(this.dynamicModels.map(m => m.namespace));
		});
	});

	describe('_applyAssociations', function () {
		before(async function () {
			this.associations = {};
			this.associations['alpha'] = await factory.create('chimera.orm.hierarchicalAssociation', {
				fromModelId: this.dynamicModels[0].id,
				toModelId: this.dynamicModels[1].id
			});
			this.associations['beta'] = await factory.create('chimera.orm.hierarchicalAssociation', {
				fromModelId: this.dynamicModels[1].id,
				toModelId: this.dynamicModels[2].id
			});

			await this.orm._loadStaticSchemas();
			await this.orm._loadDynamicSchemas();

			this.schemaSpy1 = sinon.spy(this.orm._registry[this.dynamicModels[0].namespace].schema, 'associate');
			this.schemaSpy2 = sinon.spy(this.orm._registry[this.dynamicModels[1].namespace].schema, 'associate');
			this.schemaSpy3 = sinon.spy(this.orm._registry[this.dynamicModels[2].namespace].schema, 'associate');
		});

		after(function () {
			this.schemaSpy1.restore();
			this.schemaSpy2.restore();
			this.schemaSpy3.restore();
		});

		it('should apply associations to registered schemas', function () {
			this.orm._applyAssociations();

			this.schemaSpy1.should.have.been.calledOnce;
			this.schemaSpy1.firstCall.args.should.containSubset([
				[ { id: this.associations['alpha'].id } ]
			]);

			this.schemaSpy2.should.have.been.calledOnce;
			this.schemaSpy2.firstCall.args.should.containSubset([
				[
					{ id: this.associations['alpha'].id },
					{ id: this.associations['beta'].id }
				]
			]);

			this.schemaSpy3.should.have.been.calledOnce;
			this.schemaSpy3.firstCall.args.should.containSubset([
				[ { id: this.associations['beta'].id } ]
			]);
		});
	});

	describe('_compile', function () {
		before(async function () {
			await this.orm._loadStaticSchemas();
			await this.orm._loadDynamicSchemas();
		});

		it('should compile registered schemas into mongoose models', function () {
			this.orm._compile();

			this.orm.modelNames().should.containSubset([
				...this.staticModels,
				...this.dynamicModels.map(m => m.namespace)
			]);
		});
	});

	describe('migrate', function () {
		before(function () {
			this.Migration = this.orm.model('chimera.orm.migration');
		});

		beforeEach(function () {
			this.mockLoadMigrations = sinon.stub(this.orm, '_loadMigrations');
		});

		afterEach(async function () {
			this.mockLoadMigrations.restore();
			await this.Migration.deleteMany({});
		});

		it('should execute pending migration scripts', async function () {
			this.mockMigrations = (await factory.buildMany('chimera.orm.migration', 3)).map(
				migration => migration.toJSON({ getters: true })
			);
			this.mockLoadMigrations.resolves(this.mockMigrations);

			const migrations = await this.orm.migrate({ logging: false });
			migrations.should.have.lengthOf(3);
			migrations.forEach(tracked => this.mockMigrations.map(migration => migration.namespace).should.include(tracked.namespace));

			const noResults = await this.orm.migrate({ logging: false });
			noResults.should.have.lengthOf(0);

			const additionalMigration = await factory.build('chimera.orm.migration', { namespace: 'chimera.module.migrationIota' });
			this.mockLoadMigrations.resolves([...this.mockMigrations, additionalMigration.toJSON({ getters: true })]);
			const onlyOneResult = await this.orm.migrate({ logging: false });
			onlyOneResult.should.have.lengthOf(1);
			onlyOneResult[0].namespace.should.equal(additionalMigration.namespace);
		});

		it('should reverse migration scripts', async function () {
			this.mockMigrations = (await factory.createMany('chimera.orm.migration', 5)).map(
				migration => migration.toJSON({ getters: true })
			);
			this.mockLoadMigrations.resolves(this.mockMigrations);

			const reversed = await this.orm.migrate({ backwards: true });
			reversed.should.have.lengthOf(5);
			reversed.forEach(reverse => this.mockMigrations.map(migration => migration.namespace).should.include(reverse.namespace));

			await factory.cleanUp();
		});

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
		it('should execute pending migration scripts, ordered by `dependsOn`', async function () {
			const alpha = await factory.build('chimera.orm.migration', { name: 'alpha' });
			const beta = await factory.build('chimera.orm.migration', { name: 'beta', dependsOn: alpha.namespace });
			const delta = await factory.build('chimera.orm.migration', { name: 'delta', dependsOn: beta.namespace });
			const gamma = await factory.build('chimera.orm.migration', { name: 'gamma', dependsOn: alpha.namespace });
			const iota = await factory.build('chimera.orm.migration', { name: 'iota', dependsOn: [gamma.namespace, delta.namespace] });
			const theta = await factory.build('chimera.orm.migration', { name: 'theta' });
			const ordering = ['alpha', 'theta', 'beta', 'gamma', 'delta', 'iota'];

			this.mockMigrations = [alpha, beta, delta, gamma, iota, theta].map(migration => {
				migration = migration.toJSON({ getters: true });
				return migration;
			});
			this.mockLoadMigrations.resolves(this.mockMigrations);

			const executed = await this.orm.migrate({ logging: false });
			executed.should.have.lengthOf(this.mockMigrations.length);
			executed.every((e, i) => ordering[i] === e.name).should.be.true;
		});
	});
});
