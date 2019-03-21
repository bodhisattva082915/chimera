import crypto from 'crypto';
import util from 'util';
import uuidV4 from 'uuid/v4';
import ChimeraSchema from 'app/orm/schema';

const schema = new ChimeraSchema('User', {
	username: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: Buffer,
		required: true
	},
	salt: 'uuid'

})
	/** Middleware */
	.pre('save', async function () {
		if (this.isNew) {
			this.salt = uuidV4();
			this.password = await util.promisify(crypto.pbkdf2)(this.password, this.salt, 100000, 128, 'sha512');
		}
	});

export default schema;
