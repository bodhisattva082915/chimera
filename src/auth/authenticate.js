import util from 'util';
import crypto from 'crypto';
import { BasicStrategy } from 'passport-http';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import orm from 'app/orm';

export const basic = new BasicStrategy(async function (username, password, done) {
	const user = await orm.model('User').findOne({ username });

	if (!user) {
		return done(null, false);
	}

	const derivedKey = await util.promisify(crypto.pbkdf2)(password, user.salt, 100000, 128, 'sha512');
	const isValidPassword = Buffer.compare(user.password, derivedKey) === 0;
	if (!isValidPassword) {
		return done(null, false);
	}

	done(null, user);
});

export const jwt = new JWTStrategy({
	secretOrKey: process.env.CHIMERA_SECRET,
	jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt')
}, async function ({ userId }, done) {
	const user = await orm.model('User').findById(userId);

	if (!user) {
		return done(null, false);
	}

	done(null, user);
});
