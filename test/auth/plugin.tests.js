import factory from 'factory-girl';
import cls from 'cls-hooked';
import orm from 'chimera/orm';
import ChimeraSchema from 'chimera/orm/schema';

describe('Auth Plugins', function () {
	before(async function () {
		this.testModel = orm.model('TestModel', new ChimeraSchema('TestSchema', { name: String }));
		this.testUser = await factory.create('chimera.auth.user');
		this.testUser2 = await factory.create('chimera.auth.user');
	});

	after(async function () {
		await factory.cleanUp();
		orm.deleteModel('TestModel');
	});

	describe('identityAudit', function () {
		const ctx = cls.getNamespace('httpContext');

		it('should add createdBy and updatedBy associations to schemas', function () {
			Object.keys(this.testModel.schema.virtuals).should.containSubset(['createdBy', 'updatedBy']);
		});

		it('should automatically set createdby and updatedBy to the current user on document create', ctx.bind(async function () {
			ctx.set('user', this.testUser);
			const instance = await (await this.testModel().save()).populate(['createdBy', 'updatedBy']).execPopulate();

			should.exist(instance.createdById);
			should.exist(instance.updatedById);
			should.exist(instance.createdBy);
			should.exist(instance.updatedBy);

			instance.createdById.toString().should.equal(this.testUser.id);
			instance.updatedById.toString().should.equal(this.testUser.id);
		}));

		it('should automatically set updatedBy to the current user on document update', ctx.bind(async function () {
			ctx.set('user', this.testUser);
			let instance = await (await this.testModel({ name: 'testName' }).save())
				.populate(['createdBy', 'updatedBy'])
				.execPopulate();

			should.exist(instance.createdById);
			should.exist(instance.updatedById);
			should.exist(instance.createdBy);
			should.exist(instance.updatedBy);

			instance.createdById.toString().should.equal(this.testUser.id);
			instance.updatedById.toString().should.equal(this.testUser.id);

			ctx.set('user', this.testUser2);
			instance.name = 'newName';
			instance = await (await instance.save()).populate(['createdBy', 'updatedBy']).execPopulate();

			should.exist(instance.createdById);
			should.exist(instance.updatedById);
			should.exist(instance.createdBy);
			should.exist(instance.updatedBy);

			instance.createdById.toString().should.equal(this.testUser.id);
			instance.updatedById.toString().should.equal(this.testUser2.id);
		}));
	});
});
