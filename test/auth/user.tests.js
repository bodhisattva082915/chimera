import mongoose from 'mongoose';
import orm from 'app/orm';
import factory from 'factory-girl';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

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
		it('should encrypt passwords using argon2 on user create', async function () {
			const userData = { username: factory.chance('email'), password: 'unecrypted' };
			const user = await factory.create('User', userData);

			user.password.should.not.equal(userData.password);
			(await argon2.verify(user.password, userData.password)).should.be.true;
		});
	});

	describe('generateTokens', function () {
		it('should create a valid JWT with the userId contained in the payload', function () {
			const { accessToken } = this.testUser.generateTokens();
			const payload = jwt.verify(accessToken, process.env.CHIMERA_SECRET);

			payload.should.containSubset({
				userId: this.testUser.id
			});
		});
	});
});
