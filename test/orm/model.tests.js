import mongoose from "mongoose";
import factory from 'factory-girl';

describe('ChimeraModel', function () {
	before(function(){
		this.model = mongoose.model('ChimeraModel');
	});

	describe('schema', function () {
		before(async function(){
			this.testModel = await factory.create('ChimeraModel', {
				name: 'TestModelA',
				module: 'TestModuleA'
			});
		});

		it('should enforce required fields', function () {
			return new this.model().validate()
				.should.eventually.be.rejectedWith(mongoose.Error.ValidationError)
				.and.containSubset({
					errors: {
						name: {kind: 'required'}
					}
				});
		});

		it('should enforce a uniqueness constraint {name, module}', function(){
			return new this.model(this.testModel.toObject()).validate()
				.should.eventually.be.rejectedWith(mongoose.Error.ValidationError)
				.and.containSubset({
					errors: {
						name: {kind: 'unique'},
						module: {kind: 'unique'}
					}
				});
		});
	});

	// describe('relations', function () {
	// 	before(async function () {
	// 		await factory.create('ChimeraField', {
	// 			modelId: this.model._id,
	// 		});
	// 	});

	// 	it('should have one-to-many relationship with ChimeraField', async function () {
	// 		const modelWithFields = await this.model.populate('fields');
	// 		console.log(modelWithFields);
	// 	});
	// });
});
