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

		this.username = factory.chance('email')();
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
				this.accessToken = jwt.sign({ userId: this.testUser.id }, process.env.CHIMERA_SECRET);
				this.req.headers = { authorization: `JWT ${this.accessToken}` };
				passport.authenticate('jwt', (err, user) => {
					if (err) {
						done(err);
					}

					user.username.should.equal = this.testUser.username;

					done();
				})(this.req, this.res, this.next);
			});

			it('should gracefully error when given invalid claims (invalid userId)', function (done) {
				this.accessToken = jwt.sign({ userId: mongoose.Types.ObjectId() }, process.env.CHIMERA_SECRET);
				this.req.headers = { authorization: `JWT ${this.accessToken}` };
				passport.authenticate('jwt', (err, user) => {
					if (err) {
						done(err);
					}

					user.should.equal(false);

					done();
				})(this.req, this.res, this.next);
			});

			it('should gracefully error when given invalid claims (non-existent userId)', function (done) {
				this.accessToken = jwt.sign({ userKey: 'jwt' }, process.env.CHIMERA_SECRET);
				this.req.headers = { authorization: `JWT ${this.accessToken}` };
				passport.authenticate('jwt', (err, user) => {
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
			it('should authenticate and respond with access / refresh tokens', async function () {
				const res = await this.server
					.post('/auth/login')
					.auth(this.username, this.password);

				res.statusCode.should.equal(200);
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
	});
});
