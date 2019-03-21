import passport from 'passport';
import { mockReq, mockRes } from 'sinon-express-mock';
import factory from 'factory-girl';
import { AuthenticationError } from 'app/auth/errors';

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
		describe('basic', function () {
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
				passport.authenticate('basic', err => {

					err.should.exist;
					err.should.be.an.instanceOf(AuthenticationError);
					done();

				})(this.req, this.res, this.next);
			});

			it('should gracefully error given invalid passwords', function (done) {
				this.req.headers = { authorization: `Basic ${Buffer.from(this.username + ':badpassword').toString('base64')}` };
				passport.authenticate('basic', err => {

					err.should.exist;
					err.should.be.an.instanceOf(AuthenticationError);
					done();

				})(this.req, this.res, this.next);
			});
		});
	});
});
