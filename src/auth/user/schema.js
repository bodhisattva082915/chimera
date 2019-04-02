import ChimeraSchema from 'app/orm/schema';
import { encryptPassword } from '../utils';

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
	emailVerified: Boolean
})
	/** Middleware */
	.pre('save', async function () {
		if (this.isNew) {
			this.password = await encryptPassword(this.password);
		}
	});

export default schema;
