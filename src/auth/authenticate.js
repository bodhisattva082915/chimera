import { BasicStrategy } from 'passport-http';

export const basic = new BasicStrategy(function (username, password, done) {
	done(null, { 'email': username });
});
