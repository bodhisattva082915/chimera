import mongoose from 'mongoose';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import chai from 'chai';
import { mockReq, mockRes } from 'sinon-express-mock';
import factory from 'factory-girl';
import app from 'app';

describe('Authentication', function () {
	before(async function () {
		await import('app/auth');

		this.username = factory.chance('word')();
		this.password = factory.chance('word', { length: 12 })();
		this.testUser = await factory.create('User', {
			username: this.username,
			password: this.password
		});
	});

	after(async function () {
		await factory.cleanUp();
	});

	beforeEach(function () {
		this.req = mockReq();
		this.res = mockRes();
		this.req.logIn = () => null;
		this.res.setHeader = (header, value) => {};
		this.next = err => {
			if (err) {
				throw err;
			}
		};
	});

	describe('Strategies', function () {
		describe('Basic', function () {
			it('should succesfully authenticate valid username/password pairs', function (done) {
				this.req.headers = { authorization: `Basic ${Buffer.from(this.username + ':' + this.password).toString('base64')}` };
				passport.authenticate('basic', (err, user) => {
					if (err) {
						done(err);
					};

					user.username.should.equal(this.username);

					done();
				})(this.req, this.res, this.next);
			});

			it('should gracefully error given invalid usernames', function (done) {
				this.req.headers = { authorization: `Basic ${Buffer.from('test.user@domain.com:' + this.password).toString('base64')}` };
				passport.authenticate('basic', (err, user) => {
					if (err) {
						done(err);
					}

					user.should.equal(false);

					done();
				})(this.req, this.res, this.next);
			});

			it('should gracefully error given invalid passwords', function (done) {
				this.req.headers = { authorization: `Basic ${Buffer.from(this.username + ':badpassword').toString('base64')}` };
				passport.authenticate('basic', (err, user) => {
					if (err) {
						done(err);
					}

					user.should.equal(false);

					done();
				})(this.req, this.res, this.next);
			});
		});

		describe('JSON Web Token', function () {
			it('should successfully authenticate valid JWTs', function (done) {
				this.accessToken = jwt.sign({ userId: this.testUser.id }, this.testUser.password);
				this.req.headers = { authorization: `Bearer ${this.accessToken}` };
				passport.authenticate('bearer', (err, user) => {
					if (err) {
						done(err);
					}

					user.username.should.equal = this.testUser.username;

					done();
				})(this.req, this.res, this.next);
			});

			it('should gracefully error when given invalid claims (non-existent userId)', function (done) {
				this.accessToken = jwt.sign({ userKey: 'jwt' }, this.testUser.password);
				this.req.headers = { authorization: `Bearer ${this.accessToken}` };
				passport.authenticate('bearer', (err, user) => {
					if (err) {
						done(err);
					}

					user.should.equal(false);

					done();
				})(this.req, this.res, this.next);
			});

			it('should gracefully error when given invalid claims (invalid userId)', function (done) {
				this.accessToken = jwt.sign({ userId: mongoose.Types.ObjectId() }, this.testUser.password);
				this.req.headers = { authorization: `Bearer ${this.accessToken}` };
				passport.authenticate('bearer', (err, user) => {
					if (err) {
						done(err);
					}

					user.should.equal(false);

					done();
				})(this.req, this.res, this.next);
			});

			it('should gracefully error when given bad signature', function (done) {
				this.accessToken = jwt.sign({ userId: this.testUser.id }, 'hackerNoHacking');
				this.req.headers = { authorization: `Bearer ${this.accessToken}` };
				passport.authenticate('bearer', (err, user) => {
					if (err) {
						done(err);
					}

					user.should.equal(false);

					done();
				})(this.req, this.res, this.next);
			});
		});
	});

	describe('REST API', function () {
		before(function () {
			this.server = chai.request(app).keepOpen();
		});

		after(function () {
			this.server.close();
		});

		describe('/login', function () {
			it('should authenticate and respond with 200 and an access token', async function () {
				const res = await this.server
					.post('/auth/login')
					.auth(this.username, this.password);

				res.statusCode.should.equal(200);
				res.body.should.have.keys('accessToken');
			});

			it('should fail authentication with bad username and respond with 401', async function () {
				const res = await this.server
					.post('/auth/login')
					.auth('baduser', this.password);

				res.statusCode.should.equal(401);
			});

			it('should fail authentication with bad password and respond with 401', async function () {
				const res = await this.server
					.post('/auth/login')
					.auth(this.username, 'badpass');

				res.statusCode.should.equal(401);
			});

			it('should fail authentication with malformed authorization string and respond with 400', async function () {
				const res = await this.server
					.post('/auth/login')
					.set('Authorization', 'Basic thisisnotthecorrectformat');

				res.statusCode.should.equal(400);
			});
		});

		describe('GET /password-reset', function () {
			it('should validate the request params', async function () {
				const res1 = await this.server
					.get('/auth/password-reset')
					.set('content-type', 'application/json');

				const res2 = await this.server
					.get('/auth/password-reset')
					.set('content-type', 'application/json')
					.query({ email: 'benaseotn' });

				res1.statusCode.should.equal(422);
				res1.body.errors.should.have.length(2);
				res2.statusCode.should.equal(422);
				res2.body.errors.should.have.length(1);
			});

			it('should route requests to the sendResetToken handler and respond successfully with 200', async function () {
				const res = await this.server
					.get('/auth/password-reset')
					.set('content-type', 'application/json')
					.query({ email: this.testUser.email });

				res.statusCode.should.equal(200);
			});
		});

		describe('POST /password-reset', function () {
			beforeEach(async function () {
				this.testUser = await this.testUser.refreshFromDb('+password');
				this.resetToken = this.testUser.generateResetToken();
			});

			it('should validate the request body', async function () {
				const res = await this.server
					.post('/auth/password-reset')
					.set('Authorization', `Bearer ${this.resetToken}`)
					.set('content-type', 'application/json');

				res.statusCode.should.equal(422);
				res.body.errors.should.have.length(1);
			});

			it('should reset the user password to the new password and respond with 204', async function () {
				const newPassword = 'newpassword';
				const res = await this.server
					.post('/auth/password-reset')
					.set('Authorization', `Bearer ${this.resetToken}`)
					.set('content-type', 'application/json')
					.send({ password: newPassword });

				res.statusCode.should.equal(204);
			});

			it('should reject the same token from being used more than once to reset the user password', async function () {
				const newPassword = 'newpassword';
				const res = await this.server
					.post('/auth/password-reset')
					.set('Authorization', `Bearer ${this.resetToken}`)
					.set('content-type', 'application/json')
					.send({ password: newPassword });

				const res401 = await this.server
					.post('/auth/password-reset')
					.set('Authorization', `Bearer ${this.resetToken}`)
					.set('content-type', 'application/json')
					.send({ password: newPassword });

				res.statusCode.should.equal(204);
				res401.statusCode.should.equal(401);
			});
		});
	});
});
