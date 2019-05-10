import factory from 'factory-girl';
import sinon from 'sinon';
import { mockReq, mockRes } from 'sinon-express-mock';
import orm from 'chimera/orm';
import ChimeraResource from 'chimera/api/resource';
import * as errorResponses from 'chimera/api/responses';

describe('ChimeraResourceErrors', function () {
	before(async function () {
		this.testModel = orm.model(factory.chance('word')(), new orm.Schema('testModel'));
		this.testResource = new ChimeraResource(this.testModel);

		this.documentDoesNotExist = errorResponses.documentDoesNotExist;
		this.validationFailed = errorResponses.validationFailed;
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
			const err = new orm.Error.DocumentNotFoundError();

			this.testResource.router.stack.should.containSubset([{
				name: this.documentDoesNotExist.name
			}]);

			this.documentDoesNotExist(err, this.req, this.res, this.next);
			this.wasHandled(404);
		});
	});

	describe('validationFailed', function () {
		it('should handle responses when controllers throw ValidationError', function () {
			const err = new orm.Error.ValidationError();

			this.testResource.router.stack.should.containSubset([{
				name: this.validationFailed.name
			}]);

			this.validationFailed(err, this.req, this.res, this.next);
			const response = this.wasHandled(422);
			response.error.should.have.property('validationErrors');
		});
	});
});
