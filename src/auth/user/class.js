import mongoose from 'mongoose';

class User extends mongoose.Model {

	/**
     * Generate access and refresh tokens for the given user.
     */
	generateTokens () {
		return {
			accessToken: 'access',
			refreshToken: 'refresh'
		};
	}
}

export default User;
