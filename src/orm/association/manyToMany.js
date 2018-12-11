import mongoose from 'mongoose';
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
});

export default ChimeraManyToMany;
