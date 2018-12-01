import factory from 'factory-girl';
import { mockReq, mockRes } from 'sinon-express-mock';
import ChimeraResource from 'app/api/resource';

describe('ChimeraResource', function () {
	before(async function () {
		this.testModel = await factory.create('ChimeraModel', {
			module: 'testmodule',
			name: 'TestModel'
		});

		this.testFields = await factory.createMany('ChimeraField', 3, {
			chimeraModelId: this.testModel.id
		});

		this.testResource = new ChimeraResource(await this.testModel.compile());
	});

	after(async function () {
		await factory.cleanUp();
	});

	describe('getList', function () {
		before(function () {
			this.req = mockReq();
			this.res = mockRes();
		});

		it('should return a list of objects by the resource type', async function () {
			await this.testResource.getList(this.req, this.res);

			this.res.send.should.be.called;
		});
	});
});
