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

		this.testCustomType = function (fieldDef, validValue, invalidValue) {
			this.schema.add({ customFieldType: fieldDef });

			const Model = mongoose.model(this.modelName, this.schema);
			const isInvalid = new Model({ customFieldType: invalidValue || `invalidValue${factory.chance('word')()}` }).validateSync();
			const isValid = new Model({ customFieldType: validValue }).validateSync();

			should.exist(isInvalid);
			should.not.exist(isValid);

			isInvalid.should.be.an.instanceof(mongoose.Error.ValidationError);
			isInvalid.errors.should.containSubset({
				customFieldType: {
					name: 'CastError'
				}
			});

			return isInvalid;
		};

		this.resetModeling = function () {
			try {
				mongoose.deleteModel(this.modelName);
			} catch (err) {
				if (!(err instanceof mongoose.Error.MissingSchemaError)) {
					throw err;
				}
			}
		};
	});

	afterEach(function () {
		this.resetModeling();
	});

	describe('Email', function () {
		it('should validate input values as strings following an email pattern', function () {
			this.testCustomType('email', 'test.user@domain.com');
		});
	});

	describe('Phone', function () {
		it('should validate input values as strings following a phone number pattern', function () {
			this.testCustomType('phone', '+18005551234');
		});

		it('should throw when an invalid locale is specified', function () {
			(() => this.schema.add({
				phoneField: {
					type: 'phone',
					locale: 'notALocale'
				}
			})).should.throw();

			(() => this.schema.add({
				phoneField: {
					type: 'phone',
					locale: ['en-US', 'badLocale']
				}
			})).should.throw();
		});
	});

	describe('UUID', function () {
		before(function () {
			this.uuidV3 = require('uuid/v3');
			this.uuidV4 = require('uuid/v4');
			this.uuidV5 = require('uuid/v5');
		});

		it('should validate input values as strings following a uuid pattern', function () {
			this.testCustomType('uuid', this.uuidV4());
		});

		it('should validate uuid values by specific versions', function () {
			this.testCustomType(
				{ type: 'uuid', version: 4 },
				this.uuidV4(),
				this.uuidV3('Hello World', this.uuidV4())
			);

			this.resetModeling();

			this.testCustomType(
				{ type: 'uuid', version: 5 },
				this.uuidV5('Hello World', this.uuidV4()),
				this.uuidV4()
			);
		});

		it('should throw when an invalid version option is specified', function () {
			(() => this.schema.add({
				uuidField: {
					type: 'uuid',
					version: 8
				}
			})).should.throw();
		});
	});
});
