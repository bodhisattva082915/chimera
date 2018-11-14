import mongoose from 'mongoose';

const schema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	module: {
		type: String
	}
})
	/** Indexing */
	.index({ name: 1, module: 1 }, { unique: true });

export default schema;
