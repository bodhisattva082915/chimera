import ChimeraSchema from '../schema';

const schema = new ChimeraSchema('ChimeraModel', {
	name: {
		type: String,
		required: true
	},
	module: {
		type: String,
		default: ''
	}
})
	/** Associations */
	.hasMany('ChimeraField', {
		foreignField: 'chimeraModelId',
		as: 'chimeraFields'
	})

	/** Indexing */
	.index({ name: 1, module: 1 }, { unique: true });

export default schema;
