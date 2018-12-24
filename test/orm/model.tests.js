import mongoose from 'mongoose';
import factory from 'factory-girl';

describe('ChimeraModel', function () {
	before(async function () {
		this.ChimeraModel = mongoose.model('ChimeraModel');
		this.ChimeraField = mongoose.model('ChimeraField');

		this.testModel = await factory.create('ChimeraModel', {
			name: 'TestModelA',
			module: 'TestModuleA'
		});

		this.associatedFields = await this.ChimeraField.find({ chimeraModelId: this.testModel.id });
	});

	after(async function () {
		await factory.cleanUp();
	});

	describe('schema', function () {
		it('should enforce required fields', function () {
			return new this.ChimeraModel().validate()
				.should.eventually.be.rejectedWith(mongoose.Error.ValidationError)
				.and.containSubset({
					errors: {
						name: { kind: 'required' }
					}
				});
		});

		it('should enforce a uniqueness constraint {name, module}', function () {
			return new this.ChimeraModel(this.testModel.toObject()).validate()
				.should.eventually.be.rejectedWith(mongoose.Error.ValidationError)
				.and.containSubset({
					errors: {
						name: { kind: 'unique' },
						module: { kind: 'unique' }
					}
				});
		});
	});

	describe('associations', function () {
		it('should have a hasMany association with ChimeraField', async function () {
			const model = await this.ChimeraModel.findById(this.testModel.id).populate('chimeraFields').exec();

			model.should.have.property('chimeraFields');
			model.chimeraFields.should.have.lengthOf(3);
		});
	});

	describe('loadHydrated', function () {
		before(async function () {
			await factory.create('ChimeraModel', { name: 'My Modelo' });
		});

		it('should find and return ChimeraModels hydrated with associated schema configuration content', async function () {
			const models = await this.ChimeraModel.loadHydrated();

			models.forEach(model => {
				model['chimeraFields'].should.be.an('array');
				model['dominantAssociations'].should.be.an('array');
				model['subordinateAssociations'].should.be.an('array');
			});
		});

		it('should find and return a subset of hydrated ChimeraModels by supplied conditions', async function () {
			const models = await this.ChimeraModel.loadHydrated({
				_id: {
					$in: [this.testModel.id]
				}
			});

			models.should.have.lengthOf(1);
			models.should.containSubset([
				{ id: this.testModel.id }
			]);
		});
	});

	describe('compile', function () {
		it('should successfully register a mongoose model with a schema compiled from ChimeraFields', async function () {
			const compiled = await this.testModel.compile();
			compiled.schema.paths.should.include.keys(...this.associatedFields.map(field => field.name));
		});
	});
});
