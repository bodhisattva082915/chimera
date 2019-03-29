import mongoose from 'mongoose';
import passport from 'passport';
import * as strategies from './authenticate';
import authRouter from './routes';

Object.values(strategies)
	.forEach(authStrategy => passport.use(authStrategy));

export default authRouter;
