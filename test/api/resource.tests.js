import factory from 'factory-girl';
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

	describe('getList', function () {
		beforeEach(function () {
			this.req = mockReq();
			this.res = mockRes();
			this.next = () => null;

			this.wasSuccessful = function () {
				this.res.json.should.have.been.calledOnce;
				this.res.json.getCall(0).args.should.not.be.empty;
				this.res.json.getCall(0).args[0].should.be.an('object');

				return this.res.json.getCall(0).args[0];
			};
		});

		afterEach(function () {
			sinon.restore();
		});

		it('should respond with meta information about the response data', async function () {
			await this.testResource.getList(this.req, this.res, this.next);

			const results = this.wasSuccessful();

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

			results.objects.should.have.lengthOf(7);
			results.objects.should.containSubset(this.testModelInstances.map(obj => ({ _id: obj._id })));
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

			results.objects.length.should.be.lt(7);
			results.objects.forEach(obj => obj.should.satisfy(obj => {
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

			results.objects.forEach((obj, index) => obj.should.satisfy(curr => {
				if (index === 0) {
					return true;
				}

				const prev = results.objects[index - 1];

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
			results.objects.length.should.be.lte(3);

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
			results.objects.should.have.lengthOf(2);
			results.objects[0][this.testField.name].should.equal(5);
			results.objects[1][this.testField.name].should.equal(4);
		});

		it(`should respond with list of objects with only properties as specified by the 'select' query param`, async function () {
			this.req.query = {
				select: [this.testField.name]
			};

			await this.testResource.getList(this.req, this.res, this.next);

			const results = this.wasSuccessful();

			results.objects.forEach(obj => Object.keys(obj).should.deep.equal(this.req.query.select));
		});
	});
});
