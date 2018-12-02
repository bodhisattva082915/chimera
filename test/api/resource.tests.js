import factory from 'factory-girl';
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

		factory.define(this.testModel.modelName, this.testModel, {
			[this.cFields[0].name]: factory.seq(`${this.cModel.name}.${this.cFields[0].name}`, n => n)
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

		it(`should respond with a filtered list of objects by using the 'filter' query param`, async function () {
			await this.testResource.getList(this.req, this.res, this.next);

			const results = this.wasSuccessful();
		});
	});
});
