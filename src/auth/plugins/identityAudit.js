import cls from 'cls-hooked';
import ChimeraSchema from 'chimera/orm/schema';

/**
 * Adds createdBy and updatedBy fields for audting purposes. Automatically sets values for
 * these fields on document create/update.
 */
module.exports = function identityAudit (schema) {
	if (schema instanceof ChimeraSchema) {
		schema.belongsTo('chimera.auth.user', { as: 'createdBy' });
		schema.belongsTo('chimera.auth.user', { as: 'updatedBy' });

		schema.pre('save', function identityAuditTrail (next) {
			const user = cls.getNamespace('httpContext').get('user');

			if (this.isNew && user) {
				this.createdById = user._id;
				this.updatedById = user._id;
				return next();
			}

			if (this.isModified() && user) {
				this.updatedById = user._id;
				next();
			}

			next();
		});
	}
};
