import factory from 'factory-girl';

describe('ChimeraModel', function () {
	before(function () {
		this.mapper = this.store.getMapper('ChimeraModel');
	});

	describe('schema', function () {
		it('should enforce required fields', function () {
			const isNotValid = this.mapper.validate({});
			const isValid = this.mapper.validate({
				name: factory.chance('word')()
			});

			isNotValid.should.be.an('array');
			should.equal(isValid, undefined);
		});
	});

	describe('relations', function () {
		before(async function () {
			const model = await factory.create('ChimeraModel');
			const field = await factory.create('ChimeraField', {
				title: 'fuck youooooooooo'
			});
		});

		it('should hasMany ChimeraField', async function () {
			const model = this.mapper.createRecord({
				_id: factory.chance('guid')(),
				name: 'TestModel'
			});

			await model.loadRelations(['fields']);

			model.should.have.property('fields');
			model.fields.should.have.length(0);
		});
	});
});
