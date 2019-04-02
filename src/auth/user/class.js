import os from 'os';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import smtp from 'app/smtp';
import { encryptPassword } from '../utils';
import { AuthenticationError } from '../errors';

class User extends mongoose.Model {

	generateToken (payload = {}, opts = {}) {

		if (!this.password) {
			throw new AuthenticationError(`Cannot sign tokens with password: ${this.password}`);
		}

		return jwt.sign({
			userId: this.id,
			...payload
		}, this.password, {
			expiresIn: '1hr',
			...opts
		});
	}

	async resetPassword (password) {
		this.password = await encryptPassword(password);
		await this.save();
	}

	/**
	 * Emails a password reset token to the given user.
	 */
	async emailResetToken () {
		const resetToken = this.generateToken(null, { expiresIn: '10 minutes' });
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
