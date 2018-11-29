import mongoose from 'mongoose';
import factory from 'factory-girl';

describe('ChimeraModel', function () {
	before(async function () {
		this.ChimeraModel = mongoose.model('ChimeraModel');
		this.testModel = await factory.create('ChimeraModel', {
			name: 'TestModelA',
			module: 'TestModuleA'
		});
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
		before(async function () {
			this.associatedFields = await factory.createMany('ChimeraField', 2, {
				chimeraModelId: this.testModel._id
			});
		});

		it('should have a hasMany association with ChimeraField', async function () {
			const model = await this.ChimeraModel.findById(this.testModel._id).populate('chimeraFields').exec();

			model.should.have.property('chimeraFields');
			model.chimeraFields.should.have.lengthOf(this.associatedFields.length);
		});
	});
});
