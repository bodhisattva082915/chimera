import faker from 'faker';

describe('ChimeraModel', function () {
	before(function () {
		this.mapper = this.store.getMapper('ChimeraModel');
	});

	describe('schema', function () {
		it('should enforce required fields', function () {
			const isNotValid = this.mapper.validate({});
			const isValid = this.mapper.validate({
				name: faker.random.word()
			});

			isNotValid.should.be.an('array');
			should.equal(isValid, undefined);
		});
	});

	describe('relations', function () {
		it('should hasMany ChimeraField', async function () {
			const model = this.mapper.createRecord({
				_id: faker.random.uuid(),
				name: 'TestModel'
			});

			await model.loadRelations(['fields']);

			model.should.have.property('fields');
			model.fields.should.have.length(0);
		});
	});
});
