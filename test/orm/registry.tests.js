import mongoose from 'mongoose';
import factory from 'factory-girl';
import ModelRegistry from 'app/orm/registry';

describe('ModelRegistry', function () {
	before(async function () {
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
	});

	beforeEach(async function () {
		this.registry = new ModelRegistry();
	});

	describe('loadStaticSchemas', function () {
		it('should register statically defined schemas', async function () {
			await this.registry.loadStaticSchemas();

			this.registry.should.include.keys(this.staticModels);
		});
	});

	describe('loadDynamicSchemas', function () {
		it('should register dynamically defined schemas', async function () {
			await this.registry.loadDynamicSchemas();

			this.registry.should.include.keys(this.dynamicModels.map(m => m.name));
		});
	});

	describe('associate', function () {
		before(async function () {
			await this.registry.loadStaticSchemas();
			await this.registry.loadDynamicSchemas();

			this.associations = {};
			this.associations[0] = await factory.create('ChimeraAssociation', {
				type: 'OneToMany'
			});
		});

		it('should apply associations to registered schemas', function () {
			this.registry.applyAssociations();

		});
	});

	describe('compile', function () {
		before(async function () {
			await this.registry.loadStaticSchemas();
			await this.registry.loadDynamicSchemas();
		});

		it('should compile registered schemas into mongoose models', function () {
			this.registry.compile();

			mongoose.modelNames().should.containSubset([
				...this.staticModels,
				...this.dynamicModels.map(m => m.name)
			]);
		});
	});
});
