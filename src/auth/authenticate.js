import { BasicStrategy } from 'passport-http';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import isEmail from 'validator/lib/isEmail';
import argon2 from 'argon2';
import orm from 'chimera/orm';
import jwt from 'jsonwebtoken';
import cls from 'cls-hooked';

const context = cls.getNamespace('httpContext');

export const basic = new BasicStrategy(async function (username, password, done) {
	try {
		let conditions = { username };
		if (isEmail(username)) {
			conditions = { email: username };
		}

		const user = await orm.model('chimera.auth.user').findOne(conditions, '+password');
		if (!user) {
			return done(null, false);
		}

		const isValidPassword = await argon2.verify(user.password, password);
		if (!isValidPassword) {
			return done(null, false);
		}

		context.set('user', user);
		done(null, user);
	} catch (err) {
		done(err);
	}
});

export const bearer = new BearerStrategy(async function (token, done) {
	try {
		const { userId } = jwt.decode(token);
		if (!userId) {
			return done(null, false);
		}

		const user = await orm.model('chimera.auth.user').findById(userId, '+password');
		if (!user) {
			return done(null, false);
		}

		jwt.verify(token, user[context.get('signedWith') || 'password'], err => {
			if (err) {
				return done(null, false);
			}
			context.set('user', user);
			done(null, user);
		});
	} catch (err) {
		done(err);
	}

});
