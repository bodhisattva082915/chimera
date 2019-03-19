import passport from 'passport';
import * as strategies from './authenticate';

Object.values(strategies)
	.forEach(authStrategy => passport.use(authStrategy));

export default strategies;
