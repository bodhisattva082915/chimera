import { BasicStrategy } from 'passport-http';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import argon2 from 'argon2';
import orm from 'app/orm';

export const basic = new BasicStrategy(async function (username, password, done) {
	const user = await orm.model('User').findOne({ username });

	if (!user) {
		return done(null, false);
	}

	const isValidPassword = await argon2.verify(user.password, password);
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
