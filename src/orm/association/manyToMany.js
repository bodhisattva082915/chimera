import ChimeraSchema from '../schema';

const ChimeraManyToMany = new ChimeraSchema('ChimeraManyToMany', {
	fromConfig: {
		primaryKey: String,
		foreignKey: String,
		relatedName: String,
		reverseName: String
	},
	toConfig: {
		primaryKey: String,
		foreignKey: String,
		relatedName: String,
		reverseName: String
	}
})
	/** Associations */
	.belongsTo('ChimeraModel', {
		localField: 'throughModelId',
		as: 'through'
	});

export default ChimeraManyToMany;
