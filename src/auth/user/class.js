import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import os from 'os';

class User extends mongoose.Model {

	/**
     * Generate access token for the given user.
	* TODO: Support generating refresh tokens
     */
	generateTokens (jwtOpts = {}) {
		const opts = {
			issuer: os.hostname(),
			expiresIn: '1hr',
			...jwtOpts
		};

		return {
			accessToken: jwt.sign({ userId: this.id }, process.env.CHIMERA_SECRET, opts)
		};
	};
}

export default User;
