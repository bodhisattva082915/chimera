import ChimeraSchema from 'app/orm/schema';
import { schema as UserSchema } from '../user';

/**
 * Adds createdBy and updatedBy fields for audting
 */
module.exports = function identityAudit (schema) {
	// if (schema instanceof ChimeraSchema) {
	// 	schema.belongsTo('User', {
	// 		as: 'createdBy'
	// 	});
	// 	schema.belongsTo('User', {
	// 		as: 'updatedBy'
	// 	});
	// }

	// UserSchema.hasMany(schema.name, {
	//     as:
	// })
};
