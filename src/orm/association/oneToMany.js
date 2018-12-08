import ChimeraSchema from '../schema';

const ChimeraOneToMany = new ChimeraSchema('ChimeraOneToMany', {
	foreignKey: String,
	primaryKey: String,
	relatedName: String,
	reverseName: String
})
	/** Indexing */
	.index({ fromModelId: 1, toModelId: 1, foreignKey: 1 }, { unique: true })
	.index({ fromModelId: 1, toModelId: 1, relatedName: 1 }, { unique: true })
	.index({ fromModelId: 1, toModelId: 1, reverseName: 1 }, { unique: true });

export default ChimeraOneToMany;
