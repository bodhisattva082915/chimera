import passport from 'passport';
import { Router } from 'express';
import { body } from 'express-validator/check';
import { validateReq } from 'app/middleware';
import * as handlers from './handlers';

const authRouter = new Router();
const authRoutes = new Router();

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
	.post('/request-reset', [
		validateReq(
			body('email', 'Email is required.').exists(),
			body('email', 'Value must be an email.').isEmail()
		),
		handlers.sendResetToken
	])
	.post('/initiate-reset', passport.authenticate('jwt', { session: false }), [
		validateReq(
			body('password', 'Password is required.').exists()
		),
		handlers.resetUserPassword
	]);

export default authRouter;
