import mongoose from 'mongoose';
import factory from 'factory-girl';
import cls from 'cls-hooked';
import ChimeraSchema from 'app/orm/schema';

describe('Auth Plugins', function () {
	before(async function () {
		this.testModel = mongoose.model('TestModel', new ChimeraSchema('TestSchema'));
		this.testUser = await factory.create('User');
	});

	after(async function () {
		await factory.cleanUp();
		mongoose.deleteModel('TestModel');
	});

	describe('identityAudit', function () {
		const ctx = cls.getNamespace('httpContext');

		it('should add createdBy and updatedBy associations to schemas', function () {
			Object.keys(this.testModel.schema.virtuals).should.containSubset(['createdBy', 'updatedBy']);
		});

		it('should automatically set createdby and updatedBy to the current user on document save', ctx.bind(async function () {
			ctx.set('user', this.testUser);
			const instance = await (await this.testModel().save()).populate(['createdBy', 'updatedBy']).execPopulate();

			should.exist(instance.createdById);
			should.exist(instance.updatedById);
			should.exist(instance.createdBy);
			should.exist(instance.updatedBy);

			instance.createdById.toString().should.equal(this.testUser.id);
			instance.updatedById.toString().should.equal(this.testUser.id);
		}));
	});
});
