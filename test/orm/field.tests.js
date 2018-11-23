import mongoose from "mongoose";
import factory from 'factory-girl';

describe('ChimeraField', function () {
	before(async function () {
		this.ChimeraField = mongoose.model('ChimeraField');
		this.testField = await factory.create('ChimeraField');
	});

	describe('schema', function () {
		it('should enforce uniquness constraint {name, modelId}', function () {
			return new this.ChimeraField(this.testField.toObject()).validate()
				.should.eventually.be.rejectedWith(mongoose.Error.ValidationError)
				.and.containSubset({
					errors: {
						name: {kind: 'unique'},
						modelId: {kind: 'unique'}
					}
				});
		});
	});
	describe('associations', function () {
		it('should have a foreign-key association with ChimeraModel', async function () {
			const field = await this.ChimeraField.findById(this.testField._id).populate('model').exec();
			
			field.should.have.property('model');
		});
	});
});
