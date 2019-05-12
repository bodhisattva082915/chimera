import ChimeraSchema from 'chimera/orm/schema';
import { encryptPassword } from '../../utils';

const schema = new ChimeraSchema('User', {
	username: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true,
		select: false
	},
	email: {
		type: 'email',
		required: true,
		unique: true
	},
	verified: {
		type: Boolean,
		default: false
	}
})
	/** Middleware */
	.pre('save', async function () {
		if (this.isNew) {
			this.password = await encryptPassword(this.password);
		}
	})
	.post('save', async function () {
		if (this.isModified('email') && !this.verified) {
			console.log('sending verification token');
			await this.emailVerificationToken();
		}
	});

export default schema;
