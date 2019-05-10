import factory from 'factory-girl';
import sinon from 'sinon';
import ORM from 'chimera/orm/orm';

describe('ORM', function () {
	before(async function () {
		this.orm = new ORM();
		await this.orm.init();

		this.staticModels = [
			'ChimeraModel',
			'ChimeraField',
			'ChimeraAssociation'
		];

		this.dynamicModels = await factory.createMany('ChimeraModel', 3);

		for (const model of this.dynamicModels) {
			await factory.createMany('ChimeraField', 3, {
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

			this.orm._registry.should.include.keys(this.dynamicModels.map(m => m.name));
		});
	});

	describe('_applyAssociations', function () {
		before(async function () {
			this.associations = {};
			this.associations['alpha'] = await factory.create('HierarchicalAssociation', {
				fromModelId: this.dynamicModels[0].id,
				toModelId: this.dynamicModels[1].id
			});
			this.associations['beta'] = await factory.create('HierarchicalAssociation', {
				fromModelId: this.dynamicModels[1].id,
				toModelId: this.dynamicModels[2].id
			});

			await this.orm._loadStaticSchemas();
			await this.orm._loadDynamicSchemas();

			this.schemaSpy1 = sinon.spy(this.orm._registry[this.dynamicModels[0].name].schema, 'associate');
			this.schemaSpy2 = sinon.spy(this.orm._registry[this.dynamicModels[1].name].schema, 'associate');
			this.schemaSpy3 = sinon.spy(this.orm._registry[this.dynamicModels[2].name].schema, 'associate');
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
				...this.dynamicModels.map(m => m.name)
			]);
		});
	});
});
