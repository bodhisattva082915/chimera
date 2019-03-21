import passport from 'passport';
import { mockReq, mockRes } from 'sinon-express-mock';

describe('Authentication', function () {
	before(async function () {
		await import('app/auth');
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
				this.req.headers = { authorization: `Basic ${Buffer.from('test.user@domain.com:testpassword').toString('base64')}` };
				passport.authenticate('basic', (err, user) => {
					if (err) {
						done(err);
					};

					user.email.should.equal('test.user@domain.com');

					done();
				})(this.req, this.res, this.next);
			});

			it('should succesfully error invalid username/password pairs', function (done) {
				this.req.headers = { authorization: `Basic ${Buffer.from('test.user@domain.com:badpassword').toString('base64')}` };
				passport.authenticate('basic', err => {
					err.should.exist;
				})(this.req, this.res, this.next);
			});
		});
	});
});
