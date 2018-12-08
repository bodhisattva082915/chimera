import ChimeraSchema from '../schema';

const ChimeraOneToOne = new ChimeraSchema('ChimeraOneToOne', {
	foreignKey: String,
	primaryKey: String,
	relatedName: String,
	reverseName: String
});

export default ChimeraOneToOne;
