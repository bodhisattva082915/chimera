/**
 * Defines a model that loosely resembles the structure of a mongoose document property.
 * @mongoose-option - Denotes that the given value will be used to defined the mongoose SchemaType option of the same name.
 */

import orm from 'chimera/orm';
import ChimeraSchema from 'chimera/orm/schema';

const { Mixed, Array } = orm.Schema.Types;
const schema = new ChimeraSchema('Field', {
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
	 * @mongoose-option
	 * The primitive data-type for the contents of the field.
	 */
	type: {
		type: String,
		required: true,
		enum: Object.keys(orm.SchemaTypes)
	},

	/**
	 * @mongoose-option
	 * Used to enforce if this field should require a value (neither null nor undefined)
	*/
	required: {
		type: Mixed,
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
	 * Used to specify a discrete set of values that can be set in this field.
	 */
	enum: {
		type: Array
	},

	/**
	 * Used to specify a validation pattern that should be performed for this field
	 */
	validators: {
		type: Object,
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
	 * Used to determine if this field should be indexed for quicker filtering.
	 */
	index: {
		type: Boolean,
		default: false
	}
})
	/** Associations */
	.belongsTo('chimera.orm.model', {
		localField: 'chimeraModelId',
		as: 'chimeraModel'
	}, {
		required: true
	})

	/** Indexing */
	.index({ name: 1, chimeraModelId: 1 }, { unique: true })

	/** Middleware */
	.post('save', function (field, next) {
		orm.model('chimera.orm.model').emit('compile', field.chimeraModelId);
		next();
	});

export default schema;
