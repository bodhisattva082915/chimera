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
			this.mockMigrations = [
				{
					namespace: 'chimera.module.migrationAlpha',
					description: 'Initial seed data required for this module',
					forwards: sinon.spy()
				},
				{
					namespace: 'chimera.module.migrationBeta',
					descrption: 'Additional data that should be seeded for this module',
					dependsOn: 'orm.migrationAlpha',
					forwards: sinon.spy()
				},
				{
					namespace: 'chimera.module.migrationDelta',
					descrption: 'More data that should be seeded for this module',
					dependsOn: 'orm.migrationBeta',
					forwards: sinon.spy()
				}
			];
		});

		beforeEach(function () {
			this.mockLoadMigrations = sinon.stub(this.orm, '_loadMigrations');
		});

		afterEach(function () {
			this.mockLoadMigrations.restore();
		});

		it('it should execute pending migrations scripts for registered modules', async function () {
			this.mockLoadMigrations.resolves(this.mockMigrations);

			const migrations = await this.orm.migrate();
			migrations.should.have.lengthOf(3);
			migrations.forEach(tracked => this.mockMigrations.map(migration => migration.namespace).should.include(tracked.namespace));

			const noResults = await this.orm.migrate();
			noResults.should.have.lengthOf(0);

			const additionalMigration = await factory.build('chimera.orm.migration', { namespace: 'chimera.module.migrationIota' });
			this.mockLoadMigrations.resolves([...this.mockMigrations, additionalMigration.toJSON({ getters: true })]);
			const onlyOneResult = await this.orm.migrate();
			onlyOneResult.should.have.lengthOf(1);
			onlyOneResult[0].namespace.should.equal(additionalMigration.namespace);
		});

		// it('it should execute pending migrations scripts ordered with respect to ')
	});
});
