import crypto from 'crypto';
import util from 'util';
import mongoose from 'mongoose';
import orm from 'app/orm';
import factory from 'factory-girl';

describe('User', function () {
	before(async function () {
		this.User = orm.model('User');
		this.testUser = await factory.create('User');
	});

	after(async function () {
		await factory.cleanUp();
	});

	describe('schema', function () {
		it('should enforce required fields', function () {
			return new this.User().validate()
				.should.eventually.be.rejectedWith(mongoose.Error.ValidationError)
				.and.containSubset({
					errors: {
						username: { kind: 'required' },
						password: { kind: 'required' }
					}
				});
		});

		it('should enforce uniqueness constraint {username}', function () {
			return new this.User(this.testUser.toObject()).validate()
				.should.eventually.be.rejectedWith(mongoose.Error.ValidationError)
				.and.containSubset({
					errors: {
						username: { kind: 'unique' }
					}
				});
		});
	});

	describe('middleware', function () {
		it('should encrypt passwords using pbkdf2 on user create', async function () {
			const userData = { username: factory.chance('email'), password: 'unecrypted' };
			const user = await factory.create('User', userData);

			user.password.should.not.equal(userData.password);
			Buffer.compare(
				user.password,
				await util.promisify(crypto.pbkdf2)(userData.password, user.salt, 100000, 128, 'sha512')
			).should.equal(0);
		});
	});
});
