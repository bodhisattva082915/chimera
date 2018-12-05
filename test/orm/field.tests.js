import mongoose from 'mongoose';
import factory from 'factory-girl';

describe('ChimeraField', function () {
	before(async function () {
		this.ChimeraField = mongoose.model('ChimeraField');
		this.testField = await factory.create('ChimeraField');
	});

	describe('schema', function () {
		it('should enforce uniquness constraint {name, chimeraModelId}', function () {
			return new this.ChimeraField(this.testField.toObject()).validate()
				.should.eventually.be.rejectedWith(mongoose.Error.ValidationError)
				.and.containSubset({
					errors: {
						name: { kind: 'unique' },
						chimeraModelId: { kind: 'unique' }
					}
				});
		});
	});

	describe('associations', function () {
		it('should have a belongsTo association with ChimeraModel', async function () {
			const field = await this.ChimeraField.findById(this.testField._id).populate('chimeraModel').exec();
			field.should.have.property('chimeraModel');
		});
	});

	describe('hooks', function () {

	});
});

describe('ChimeraFieldTypes', function () {
	beforeEach(function () {
		this.schema = new mongoose.Schema();
		this.modelName = 'CustomTypeTest';
	});

	afterEach(function () {
		mongoose.deleteModel(this.modelName);
	});

	describe('Email', function () {
		it('should validate input values as strings following an email pattern', function () {
			this.schema.add({ emailField: 'email' });

			const ModelWithEmail = mongoose.model(this.modelName, this.schema);
			const isInvalid = new ModelWithEmail({ emailField: 'notAnEmail' }).validateSync();
			const isValid = new ModelWithEmail({ emailField: 'test.email@domain.com' }).validateSync();

			should.exist(isInvalid);
			should.not.exist(isValid);

			isInvalid.should.be.an.instanceof(mongoose.Error.ValidationError);
			isInvalid.errors.should.containSubset({
				emailField: {
					name: 'CastError'
				}
			});
		});
	});
});
