import os from 'os';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import smtp from 'app/smtp';
import { encryptPassword } from '../utils';
import { AuthenticationError } from '../errors';

class User extends mongoose.Model {

	generateToken (payload = {}, opts = {}) {
		const jwtOpts = { ...opts };

		if (!this.password) {
			throw new AuthenticationError(`Cannot sign tokens with password: ${this.password}`);
		}

		return jwt.sign({
			userId: this.id,
			...payload
		}, this.password, jwtOpts);
	}

	generateVerificationToken () {
		return jwt.sign({ userId: this.id }, this.email, { expiresIn: '10 days' });
	}

	async verifyEmail () {
		this.verified = true;
		await this.save();
	}

	async resetPassword (password) {
		this.password = await encryptPassword(password);
		await this.save();
	}

	/**
	 * Emails a password verification token for the given user's email.
	 */
	async emailVerificationToken () {
		const verifyToken = this.generateVerificationToken();
		const verifyUrl = `https://${os.hostname}.com/auth/verify?token=${verifyToken}`;

		const info = await smtp.sendMail({
			from: process.env.CHIMERASMTP_USERNAME,
			to: this.email,
			subject: 'Email Verification',
			html: `
				<div>
					<p>
						Use the generated link below to verify the email address on your new user account. This will enable your account to recieve
						sensitive information to this email address.
					</p>
					<a href="${verifyUrl}">Verify Email</a>
				</div>
			`
		});

		return info;
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
