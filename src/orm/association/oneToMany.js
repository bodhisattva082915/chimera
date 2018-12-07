import ChimeraSchema from '../schema';

const ChimeraOneToMany = new ChimeraSchema('ChimeraOneToMany', {
	foreignKey: String,
	primaryKey: String,
	relatedName: String
});

export default ChimeraOneToMany;
