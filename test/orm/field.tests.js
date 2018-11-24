import mongoose from "mongoose";
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
						name: {kind: 'unique'},
						chimeraModelId: {kind: 'unique'}
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
});
