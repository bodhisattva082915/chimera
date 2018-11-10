import faker from 'faker';

describe('ChimeraField', function () {
	before(function () {
		this.mapper = this.store.getMapper('ChimeraField');
	});

	describe('schema', function () {
		it('should validate suitable JSON Schema property syntax', function () {
			const isValid = this.mapper.validate({
				name: 'testField',
				modelId: faker.random.uuid(),
				type: 'string',
				format: 'email',
				minLength: 2,
				maxLength: 40
			});
			const isNotValid = this.mapper.validate({
				type: 'invalidType',
				notAValidKey: true,
				format: 8
			});

			should.equal(isValid, undefined);
			isNotValid.should.be.an('array');
		});
	});
	describe('relationships', function () {
		it('should belongsTo ChimeraModel', function () {

		});
	});
});
