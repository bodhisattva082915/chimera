import os from 'os';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import smtp from 'app/smtp';

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

	/**
	 * Emails a password reset token to the given user.
	 */
	async emailResetToken (jwtOpts = {}) {
		const payload = { userId: this.id, password: this.password };
		const opts = { expiresIn: '10 minutes', ...jwtOpts };
		const resetToken = jwt.sign(payload, process.env.CHIMERA_SECRET, opts);
		const resetUrl = `https://${os.hostname}.com/auth/password-reset?token=${resetToken}`;

		const info = await smtp.sendMail({
			from: process.env.CHIMERASMTP_USERNAME,
			to: this.email,
			subject: 'Password Reset Request',
			html: `
				<div>
					<p>
						Use the generated link below to change your user password. If you did not request this password reset link you may
						safely ignore this email.
					</p>
					<a href="${resetUrl}">Password Reset</a>
				</div>
			`
		});

		return info;
	}
}

export default User;
