import ChimeraSchema from '../schema';

const ChimeraOneToMany = new ChimeraSchema('ChimeraOneToMany', {
	foreignKey: String,
	primaryKey: String,
	relatedName: String,
	relatedSetName: String
});

// TODO: Enforce unique indexes on FK | PK | relatedName
// TODO: Enforce unique indexes on FK | PK | relatedNameSet

export default ChimeraOneToMany;
