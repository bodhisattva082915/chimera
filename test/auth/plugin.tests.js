import ChimeraSchema from 'app/orm/schema';
import identityAudit from 'app/auth/plugins/identityAudit';

describe('Auth Plugins', function () {
	before(async function () {
		this.schema = new ChimeraSchema('TestSchema');
	});

	describe('identityAudit', function () {
		it('should add createdBy and updatedBy associations to schemas', function () {
			identityAudit(this.schema);
			Object.keys(this.schema.virtuals).should.containSubset(['createdBy', 'updatedBy']);
		});
	});
});
