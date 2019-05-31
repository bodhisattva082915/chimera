import passport from 'passport';
import orm from 'chimera/orm';
import { isMalformedAuthorization } from './utils';

/**
 * Authenticates the basic credentials of the user to verify if they can generate a login token.
 */
export const challenge = (strategy = 'basic') => {
	return (req, res, next) => {
		passport.authenticate(strategy, { session: false }, (err, user) => {
			if (err) {
				next(err);
			}

			/** Check for malformed authorization header for more accurate response */
			if (!user && isMalformedAuthorization(req, strategy)) {
				return res.sendStatus(400);
			}

			if (!user) {
				return res.sendStatus(401);
			}

			req.user = user;
			next();
		})(req, res, next);
	};
};

/**
 * Generates and responds to the client with an access token for the authenticated user.
 */
export const generateTokens = (req, res) => {
	const { user } = req;
	const accessToken = user.generateToken();

	res.json({ accessToken });
};

/**
 * Verfiies the email address for a given user.
 */
export const verifyUserEmail = async (req, res, next) => {
	const User = orm.model('chimera.auth.user');
	const { userId } = req.body;
	const user = await User.findOne({ id: userId });

	if (user) {
		await user.verifyEmail().catch(next);
		return res.sendStatus(204);
	}

	return res.sendStatus(404);
};

/**
 * Sends password reset token to the given user of the request.
 */
export const sendResetToken = async (req, res, next) => {
	const User = orm.model('chimera.auth.user');
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
