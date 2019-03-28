import util from 'util';
import mongoose from 'mongoose';
import factory from 'factory-girl';
import argon2 from 'argon2';
import jsdom from 'jsdom';
import jwt from 'jsonwebtoken';
import orm from 'app/orm';

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
						password: { kind: 'required' },
						email: { kind: 'required' }
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

		it('should enforce uniqueness constraint {email}', function () {
			return new this.User(this.testUser.toObject()).validate()
				.should.eventually.be.rejectedWith(mongoose.Error.ValidationError)
				.and.containSubset({
					errors: {
						email: { kind: 'unique' }
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
			const payload = jwt.verify(accessToken, this.testUser.password);

			payload.should.containSubset({
				userId: this.testUser.id
			});
		});
	});

	describe('emailResetToken', function () {
		before(async function () {
			await util.promisify(this.testSMTP.listen)();
			await util.promisify(this.testSMTP.deleteAllEmail)();
			await (await import('app/smtp')).default.verify();
		});

		after(async function () {
			await util.promisify(this.testSMTP.deleteAllEmail)();
			await util.promisify(this.testSMTP.close)();
		});

		it('should email the user a valid password reset token', function (done) {
			this.testUser.emailResetToken()
				.then(() => {
					this.testSMTP.on('new', email => {
						// Verify the token placed in the email is valid
						const dom = new jsdom.JSDOM(email.html);
						const resetLink = dom.window.document.querySelector('a');
						const resetToken = new URL(resetLink.href).searchParams.get('token');
						jwt.verify(resetToken, this.testUser.password, done);
					});
				}).catch(done);
		});
	});
});
