import mongoose from 'mongoose';
import factory from 'factory-girl';

describe('User', function () {
	before(async function () {
		this.ChimeraModel = mongoose.model('User');
	});

	after(async function () {
		// await factory.cleanUp();
	});

	describe('schema', function () {
		it('should enforce required fields', function () {
			return new this.ChimeraModel().validate()
				.should.eventually.be.rejectedWith(mongoose.Error.ValidationError)
				.and.containSubset({
					errors: {
						username: { kind: 'required' },
						password: { kind: 'required' }
					}
				});
		});

		it('should enforce a uniqueness constraint {username}', function () {
			return new this.ChimeraModel(this.testModel.toObject()).validate()
				.should.eventually.be.rejectedWith(mongoose.Error.ValidationError)
				.and.containSubset({
					errors: {
						username: { kind: 'unique' }
					}
				});
		});
	});
});
