import factory from 'factory-girl';
import mongoose from 'mongoose';
import http from 'http';
import sinon from 'sinon';
import { mockReq, mockRes } from 'sinon-express-mock';
import ChimeraResource from 'app/api/resource';

describe('ChimeraResource', function () {
	before(async function () {
		/* Chimera Definition */
		this.cModel = await factory.create('ChimeraModel', {
			module: 'testmodule',
			name: 'TestModel'
		});
		this.cFields = await factory.createMany('ChimeraField', 3, {
			chimeraModelId: this.cModel.id,
			type: 'Number'
		});

		/* Mongoose Model, Chimera Resource, and Mongoose Model based Factory */
		this.testModel = await this.cModel.compile();
		this.testResource = new ChimeraResource(this.testModel);
		this.testField = this.cFields[0];
		factory.define(this.testModel.modelName, this.testModel, {
			[this.testField.name]: factory.seq(`${this.cModel.name}.${this.testField.name}`, n => n)
		});
		this.testModelInstances = await factory.createMany(this.testModel.modelName, 7);
	});

	after(async function () {
		await factory.cleanUp();
	});

	beforeEach(function () {
		this.req = mockReq();
		this.res = mockRes();
		this.next = err => {
			if (err) {
				throw err;
			}
		};

		this.wasSuccessful = function () {
			this.res.json.should.have.been.calledOnce;
			this.res.json.getCall(0).args.should.not.be.empty;
			this.res.json.getCall(0).args[0].should.be.an('object');

			return this.res.json.getCall(0).args[0];
		};

		this.wasFailure = function (statusCode) {
			this.res.status.should.have.been.calledWith(statusCode);
			this.res.json.should.have.been.calledOnce;
			this.res.json.getCall(0).args.should.not.be.empty;
			this.res.json.getCall(0).args[0].should.be.an('object');

			return this.res.json.getCall(0).args[0];
		};
	});

	afterEach(function () {
		sinon.restore();
	});

	describe('getById', function () {
		it(`should respond with an object by the resource type and specified id`, async function () {
			const instance = await this.testModelInstances[0];
			this.req.params = {
				id: instance.id
			};

			await this.testResource.getById(this.req, this.res, this.next);

			const results = this.wasSuccessful();

			results.data.should.be.an('object');
			results.data.id.should.equal(instance.id);
		});

		it('should throw a DocumentDoesNotExist error when the object does not exist by the specified id', function () {
			this.req.params = {
				id: mongoose.Types.ObjectId()
			};

			return this.testResource.getById(this.req, this.res, this.next)
				.should.be.rejectedWith(mongoose.Error.DocumentNotFoundError);
		});
	});

	describe('getList', function () {
		it('should respond with meta information about the response data', async function () {
			await this.testResource.getList(this.req, this.res, this.next);

			const results = this.wasSuccessful();

			results.should.have.property('meta');
			results.meta.should.containSubset({
				page: 1,
				limit: 10,
				sort: { createdAt: 'desc' },
				count: 7
			});
		});

		it('should respond with a list of objects by the resource type', async function () {
			await this.testResource.getList(this.req, this.res, this.next);

			const results = this.wasSuccessful();

			results.data.should.be.an('array');
			results.data.should.have.lengthOf(7);
			results.data.should.containSubset(this.testModelInstances.map(obj => ({ id: obj.id })));
		});

		it(`should respond with a filtered list of objects by using the 'where' query param`, async function () {
			this.req.query = {
				where: {
					[this.testField.name]: {
						$gte: 2,
						$lte: 5
					}
				}
			};

			await this.testResource.getList(this.req, this.res, this.next);

			const results = this.wasSuccessful();

			results.data.length.should.be.lt(7);
			results.data.forEach(obj => obj.should.satisfy(obj => {
				return obj[this.cFields[0].name] >= 2 && obj[this.cFields[0].name] <= 5;
			}));
		});

		it(`should respond with sorted list of objects by using the 'sort' query param`, async function () {
			this.req.query = {
				sort: {
					[this.testField.name]: 'desc'
				}
			};

			await this.testResource.getList(this.req, this.res, this.next);

			const results = this.wasSuccessful();

			results.data.forEach((obj, index) => obj.should.satisfy(curr => {
				if (index === 0) {
					return true;
				}

				const prev = results.data[index - 1];

				return curr[this.testField.name] <= prev[this.testField.name];
			}));
		});

		it(`should repsond with a limited list of objects by using the 'limit' query param`, async function () {
			this.req.query = {
				limit: 3
			};

			await this.testResource.getList(this.req, this.res, this.next);

			const results = this.wasSuccessful();

			// The document set should be no more than the limit
			results.data.length.should.be.lte(3);

			// The meta object should match the req limit
			results.meta.limit.should.equal(3);

			// The meta object should still calculate the full size of the
			results.meta.count.should.equal(7);
		});

		it(`should respond with a paginated list of objects by using the 'page' query param`, async function () {
			this.req.query = {
				limit: 2,
				page: 2,
				sort: {
					[this.testField.name]: 'desc'
				}
			};

			await this.testResource.getList(this.req, this.res, this.next);

			const results = this.wasSuccessful();

			results.meta.page.should.equal(2);
			results.meta.limit.should.equal(2);

			// Page 2 should contain specific fields values since the query was sorted with
			// an entire document set of 7 objects with a sequence field in descending order
			results.meta.count.should.equal(7);
			results.data.should.have.lengthOf(2);
			results.data[0][this.testField.name].should.equal(5);
			results.data[1][this.testField.name].should.equal(4);
		});

		it(`should respond with list of objects with only properties as specified by the 'select' query param`, async function () {
			this.req.query = {
				select: [this.testField.name]
			};

			await this.testResource.getList(this.req, this.res, this.next);

			const results = this.wasSuccessful();

			results.data.forEach(obj => Object.keys(obj).should.deep.equal(this.req.query.select));
		});
	});

	describe('create', function () {
		it(`should respond with the newly created object of the resource type`, async function () {
			this.req.body = this.cFields.reduce((body, field) => ({
				...body,
				[field.name]: factory.chance('integer')()
			}), {});

			await this.testResource.create(this.req, this.res, this.next);

			const results = this.wasSuccessful();

			results.data.should.have.property('id');
			results.data.should.containSubset(this.req.body);
		});

		it('should throw a ValidationError when the request body does not pass the resource model validation', function () {
			this.req.body = this.cFields.reduce((body, field) => ({
				...body,
				[field.name]: factory.chance('word')()
			}), {});

			return this.testResource.create(this.req, this.res, this.next)
				.should.be.rejectedWith(mongoose.Error.ValidationError);
		});
	});

	describe('updateById', function () {
		before(function () {
			this.instance = this.testModelInstances[0].toJSON();
		});

		it('should update an object of the resource type by id, only modifying fields in the request body', async function () {
			this.req.params = { id: this.instance.id };
			this.req.body = this.cFields.reduce((body, field) => ({
				...body,
				[field.name]: factory.chance('integer')()
			}), {});

			await this.testResource.updateById(this.req, this.res, this.next);

			const results = this.wasSuccessful();

			results.should.have.property('data');
			results.data.should.be.an('object');
			results.data.id.should.equal(this.req.params.id);
			results.data.should.containSubset({
				...this.req.body
			});
		});

		it('should throw a DocumentDoesNotExist error when the object does not exist by the specified id', function () {
			this.req.params = { id: mongoose.Types.ObjectId() };

			return this.testResource.updateById(this.req, this.res, this.next)
				.should.be.rejectedWith(mongoose.Error.DocumentNotFoundError);
		});

		it('should throw a ValidationError when the request body does not pass the resource model validation', function () {
			this.req.params = { id: this.instance.id };
			this.req.body = this.cFields.reduce((body, field) => ({
				...body,
				[field.name]: factory.chance('word')()
			}), {});

			return this.testResource.updateById(this.req, this.res, this.next)
				.should.be.rejectedWith(mongoose.Error.ValidationError);
		});
	});

	describe('deleteById', function () {
		before(function () {
			this.instance = this.testModelInstances[0].toJSON();
		});

		it('should delete an object of the resource type by id', async function () {
			this.req.params = { id: this.instance.id };

			await this.testResource.deleteById(this.req, this.res, this.next);

			const results = this.wasSuccessful();

			results.should.have.property('data');
			results.data.should.be.an('object');
			results.data.id.should.equal(this.req.params.id);
		});

		it('should throw a DocumentDoesNotExist error when the object does not exist by the specified id', function () {
			this.req.params = { id: mongoose.Types.ObjectId() };

			return this.testResource.deleteById(this.req, this.res, this.next)
				.should.be.rejectedWith(mongoose.Error.DocumentNotFoundError);
		});
	});
});
