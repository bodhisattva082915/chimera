/**
 * Defines a model that loosely resembles the structure of a mongoose document property.
 * @mongoose-option - Denotes that the given value will be used to defined the mongoose SchemaType option of the same name.
 */

import mongoose from 'mongoose';

const { ObjectId, Mixed } = mongoose.Schema.Types;
const schema = new mongoose.Schema({
	/** 
	 * The ChimeraModel that should include this field. 
	 */
	modelId: {
		type: ObjectId,
		ref: 'ChimeraModel',
		relatedName: 'fields',
	},

	/** 
	 * The name that will be used to uniquely identify the property on the model. 
	 * This will be set as the key value in the generated mongoose schema.
	 */
	name: {
		type: String,
		required: true
	},

	/** 
	 * @mongoose-option
	 * A secondary name to use to reference the field. 
	 */
	alias: {
		type: String,
		default: ''
	},

	/** 
	 * The primitive data-type for the contents of the field. 
	 */
	type: {
		type: String,
		required: true,
		enum: [
			'string',
			'number',
			'boolean',
			'object',
		]
	},

	/** 
	 * @mongoose-option
	 * Used to enforce if this field should require a value (neither null nor undefined) 
	*/
	required: {
		type: Boolean,
		default: false
	},

	/** 
	 * @mongoose-option
	 * Used to specify a default value that should be set when this field is left blank.
	 */
	default: {
		type: Mixed,
		default: undefined
	},

	/** 
	 * @mongoose-option
	 * Used to enforce unique values in the field by enabling unique indexing in the ODM 
	 */
	unique: {
		type: Boolean,
		default: false
	},

	/** 
	 * @mongoose-option
	 * Used to determine if this field should be indexed for quicker searching. 
	 */
	index: {
		type: Boolean,
		default: false
	}
})
	/** Indexing */
	.index({ name: 1, modelId: 1 }, { unique: true });

export default schema;
