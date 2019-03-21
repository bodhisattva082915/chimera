import util from 'util';
import crypto from 'crypto';
import { BasicStrategy } from 'passport-http';
import orm from 'app/orm';
import { AuthenticationError } from './errors';

export const basic = new BasicStrategy(async function (username, password, done) {
	const user = await orm.model('User').findOne({ username });

	if (!user) {
		return done(new AuthenticationError('Invalid credentials supplied.'));
	}

	const derivedKey = await util.promisify(crypto.pbkdf2)(password, user.salt, 100000, 128, 'sha512');
	const isValidPassword = Buffer.compare(user.password, derivedKey) === 0;
	if (!isValidPassword) {
		return done(new AuthenticationError('Invalid credentials supplied.'));
	}

	done(null, user);
});
