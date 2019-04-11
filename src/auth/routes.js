import passport from 'passport';
import cls from 'cls-hooked';
import { Router } from 'express';
import { query, body } from 'express-validator/check';
import { validateReq } from 'chimera/middleware';
import * as handlers from './handlers';

const authRouter = new Router();
const authRoutes = new Router();
const ctx = cls.getNamespace('httpContext');

authRouter.use('/auth', authRoutes);
authRoutes
	.post('/login', passport.authenticate('basic', { session: false }), [
		handlers.generateTokens
	])

	/**
	 * Password Reset Flow
	 * 1.) Request a password reset. This searchs for the user by the given username and creates a token that is emailed to the user.
	 * 2.) Initiate the password reset. Recieves a request with new password credentials and the reset token to perform the password reset.
	 */
	.get('/password-reset', [
		validateReq(
			query('email', 'Email is required.').exists(),
			query('email', 'Value must be an email.').isEmail()
		),
		handlers.sendResetToken
	])
	.post('/password-reset', passport.authenticate('bearer', { session: false }), [
		validateReq(
			body('password', 'Password is required.').exists()
		),
		handlers.resetUserPassword
	])
	.get('/verify',
		(req, res, next) => {
			ctx.set('signedWith', 'email');
			next();
		},
		passport.authenticate('bearer', { session: false }),
		handlers.verifyUserEmail
	);

export default authRouter;
