import camelCase from 'lodash/camelCase';
import ChimeraSchema from '../../schema';

const schema = new ChimeraSchema('Model', {
	package: {
		type: String,
		default: 'internal'
	},
	module: {
		type: String,
		default: 'main'
	},
	name: {
		type: String,
		required: true
	},
	namespace: {
		type: String,
		get () {
			return [this.package, this.module, camelCase(this.name)].filter(x => x).join('.');
		}
	}
})
	/** Associations */
	.hasMany('chimera.orm.field', {
		foreignField: 'chimeraModelId',
		as: 'chimeraFields'
	})

	/** Defines virtuals for populating non-discriminated associations */
	.hasMany('chimera.orm.association', {
		foreignField: 'fromModelId',
		as: 'fromAssociations'
	})

	.hasMany('chimera.orm.association', {
		foreignField: 'toModelId',
		as: 'toAssociations'
	})

	/** Defines virtuals for populating discriminated (hierarchical) associations */
	.hasMany('chimera.orm.hierarchicalAssociation', {
		foreignField: 'fromModelId',
		as: 'dominantAssociations'
	})

	.hasMany('chimera.orm.hierarchicalAssociation', {
		foreignField: 'toModelId',
		as: 'subordinateAssociations'
	})

	/** Defines virtuals for populating discriminated (non-hierarchical) associations */
	.hasMany('chimera.orm.nonHierarchicalAssociation', {
		foreignField: 'fromModelId',
		as: 'fromManyAssociations'
	})

	.hasMany('chimera.orm.nonHierarchicalAssociation', {
		foreignField: 'toModelId',
		as: 'toManyAssociations'
	})

	/** Indexing */
	.index({ package: 1, module: 1, name: 1 }, { unique: true });

export default schema;
