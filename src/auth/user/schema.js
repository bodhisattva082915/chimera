
import ChimeraSchema from 'app/orm/schema';

const schema = new ChimeraSchema('User', {
	username: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	}
})
	/** Middleware */
	.pre('save', function (next) {

	});

export default schema;
