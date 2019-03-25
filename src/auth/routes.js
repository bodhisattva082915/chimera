import passport from 'passport';
import { Router } from 'express';
import * as handlers from './handlers';

const authRouter = new Router();
const authRoutes = new Router();

authRouter.use('/auth', authRoutes);
authRoutes
	.post('/login', passport.authenticate('basic', { session: false }), [
		handlers.generateTokens
		// authenticationErrorHandler,
	])
	.all('/logout', [
		// deauthenicationHandler
	])
	.post('/password-reset', [
		// validatePasswordReset,
		// passwordResetErrorHandler,
		// passwordResetSuccessHandler
	]);

export default authRouter;
