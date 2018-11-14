import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;
const schema = new mongoose.Schema({
	modelId: {
		type: ObjectId,
		ref: 'ChimeraModel'
	},
	name: {
		type: Object,
		required: true
	},
	type: {
		type: String,
		required: true,
		enum: [
			'string',
			'text',
			'richText',
			'mdText'
		]
	},
	alias: {
		type: String
	},
	required: Boolean,
	unique: Boolean,
	index: Boolean
})
	/** Indexing */
	.index({ name: 1, module: 1 }, { unique: true });

export default schema;
