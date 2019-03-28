import { BasicStrategy } from 'passport-http';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import argon2 from 'argon2';
import orm from 'app/orm';
import jwt from 'jsonwebtoken';

// TODO: Support user lookup by username or email
export const basic = new BasicStrategy(async function (username, password, done) {
	const user = await orm.model('User').findOne({ username }, '+password');

	if (!user) {
		return done(null, false);
	}

	const isValidPassword = await argon2.verify(user.password, password);
	if (!isValidPassword) {
		return done(null, false);
	}

	done(null, user);
});

export const bearer = new BearerStrategy(async function (token, done) {
	const { userId } = jwt.decode(token);
	if (!userId) {
		return done(null, false);
	}

	const user = await orm.model('User').findById(userId, '+password');
	if (!user) {
		return done(null, false);
	}

	jwt.verify(token, user.password, err => {
		if (err) {
			return done(null, false);
		}

		done(null, user);
	});
});
