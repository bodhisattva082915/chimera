import orm from 'app/orm';

/**
 * Generates and responds to the client with an access token for the authenticated user.
 */
export const generateTokens = (req, res) => {
	const { user } = req;
	const { accessToken } = user.generateTokens();

	res.json({ accessToken });
};

/**
 * Sends password reset token to the given user of the request.
 */
export const sendResetToken = async (req, res, next) => {
	const User = orm.model('User');
	const { email } = req.body;
	const user = await User.findOne({ email }, '+password');

	if (user) {
		user.emailResetToken().catch(err => {
			return next(err);
		});
	}

	res.sendStatus(200);
};

export const resetUserPassword = async (req, res) => {
	const { user } = req;
	const { password } = req.body;

	await user.resetPassword(password);

	res.sendStatus(204);
};
