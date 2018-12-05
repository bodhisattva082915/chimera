import factory from 'factory-girl';
import mongoose from 'mongoose';
import sinon from 'sinon';
import { mockReq, mockRes } from 'sinon-express-mock';
import ChimeraResource from 'app/api/resource';
import * as errorResponses from 'app/api/responses';

describe('ChimeraResourceErrors', function () {
	before(async function () {
		this.testModel = mongoose.model(factory.chance('word')(), new mongoose.Schema({
			field1: String,
			field2: {
				type: String,
				required: true
			},
			field3: {
				type: Number,
				enum: [1, 2, 3]
			}
		}));

		// factory.define(this.testModel.modelName, this.testModel, {
		// 	field1: factory.chance('word')(),
		// 	field2: factory.chance('word')(),
		// 	field3: factory.chance('integer', { min: 1, max: 3 })
		// });

		// this.testModelInstances = await factory.createMany(this.testModel.modelName, 5);
		this.testResource = new ChimeraResource(this.testModel);
		this.documentDoesNotExist = errorResponses.documentDoesNotExist;
	});

	after(async function () {
		await factory.cleanUp();
	});

	beforeEach(function () {
		this.req = mockReq();
		this.res = mockRes();
		this.next = sinon.spy();

		this.wasHandled = function (statusCode) {
			this.res.status.should.have.been.calledWith(statusCode);
			this.res.json.should.have.been.calledOnce;
			this.next.should.have.been.calledOnce;
			this.next.getCall(0).args.should.have.lengthOf(0);

			const response = this.res.json.getCall(0).args[0];

			response.should.have.property('error');

			return response;
		};
	});

	afterEach(function () {
		sinon.restore();
	});

	describe('documentDoesNotExist', function () {
		it('should handle responses when controllers throw DocumentDoesNotExistError', function () {
			const err = new mongoose.Error.DocumentNotFoundError();

			this.testResource.router.stack.should.containSubset([{
				name: this.documentDoesNotExist.name
			}]);

			this.documentDoesNotExist(err, this.req, this.res, this.next);
			this.wasHandled(404);
		});
	});

});
