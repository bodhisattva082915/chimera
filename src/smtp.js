import 'env';
import nodemailer from 'nodemailer';

export default nodemailer.createTransport({
	host: process.env.CHIMERASMTP_HOST,
	port: process.env.CHIMERASMTP_PORT,
	secure: process.env.NODE_ENV === 'production',
	ignoreTLS: process.env.NODE_ENV !== 'production',
	auth: {
		user: process.env.CHIMERASMTP_USERNAME,
		pass: process.env.CHIMERASMTP_PASSWORD
	}
});
