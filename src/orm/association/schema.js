import mongoose from 'mongoose';
import ChimeraSchema from '../schema';

const schema = new ChimeraSchema('ChimeraAssociation', {

}, {
	discriminatorKey: 'type'
})
	/** Associations */
	.belongsTo('ChimeraModel', {
		localField: 'fromModelId',
		as: 'from'
	}, {
		required: true
	})
	.belongsTo('ChimeraModel', {
		localField: 'toModelId',
		as: 'to'
	}, {
		required: true
	})

	/** Middleware */
	/** Require valid discrimination */
	.pre('validate', function (next) {
		const validDiscriminators = Object.keys(this.schema.discriminators);

		let err;
		if (!this.type) {
			err = new mongoose.Error.ValidatorError({
				type: 'required',
				path: 'type',
				value: this.type,
				message: `Path 'type' is required.`
			});
		} else if (!validDiscriminators.includes(this.type)) {
			err = new mongoose.Error.ValidatorError({
				type: 'enum',
				path: 'type',
				value: this.type,
				message: `'${this.type}' is not a valid enum value for path 'type'.`,
				enumValues: validDiscriminators
			});
		}

		if (err) {
			const validationError = new mongoose.Error.ValidationError(this);
			validationError.errors.type = err;

			// Surface other validation errors before kicking out
			const _validationError = this.validateSync();
			if (_validationError) {
				validationError.errors = Object.assign(validationError.errors, _validationError.errors);
			}

			next(validationError);
		}
		next();
	});

export default schema;
