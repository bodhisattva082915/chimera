import ChimeraSchema from '../schema';

const ChimeraOneToMany = new ChimeraSchema('ChimeraOneToMany', {
	foreignKey: String,
	primaryKey: String,
	relatedName: String,
	relatedSetName: String
});

export default ChimeraOneToMany;
