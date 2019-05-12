
import ChimeraSchema from '../../schema';

const schema = new ChimeraSchema('ChimeraModel', {
	name: {
		type: String,
		required: true
	},
	module: {
		type: String,
		default: ''
	},
	namespace: {
		type: String,
		get () {
			return [this.module, this.name].filter(x => x).join('.');
		}
	}
})
	/** Associations */
	.hasMany('ChimeraField', {
		foreignField: 'chimeraModelId',
		as: 'chimeraFields'
	})

	/** Defines virtuals for populating non-discriminated associations */
	.hasMany('ChimeraAssociation', {
		foreignField: 'fromModelId',
		as: 'fromAssociations'
	})

	.hasMany('ChimeraAssociation', {
		foreignField: 'toModelId',
		as: 'toAssociations'
	})

	/** Defines virtuals for populating discriminated (hierarchical) associations */
	.hasMany('HierarchicalAssociation', {
		foreignField: 'fromModelId',
		as: 'dominantAssociations'
	})

	.hasMany('HierarchicalAssociation', {
		foreignField: 'toModelId',
		as: 'subordinateAssociations'
	})

	/** Defines virtuals for populating discriminated (non-hierarchical) associations */
	.hasMany('NonHierarchicalAssociation', {
		foreignField: 'fromModelId',
		as: 'fromManyAssociations'
	})

	.hasMany('NonHierarchicalAssociation', {
		foreignField: 'toModelId',
		as: 'toManyAssociations'
	})

	/** Indexing */
	.index({ name: 1, module: 1 }, { unique: true });

export default schema;
