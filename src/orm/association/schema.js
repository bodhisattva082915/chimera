import mongoose from 'mongoose';
import ChimeraSchema from '../schema';

const schema = new ChimeraSchema('ChimeraAssociation', {
	fromModel: {
		primaryKey: {
			type: String,
			description: `Specifies which field on the 'from' model should be used as the primary key.`
		},
		foreignKey: {
			type: String,
			description: `Specifies the name of the field on the 'through' model that will hold foreign key.
						  (This is only relevant in non-hierarchical associations)`
		},
		relatedName: {
			type: String,
			description: `Specifies the name to use for the virtual field on the 'through' model.
						  (This is only relevant in non-hierarchical associations)`
		},
		reverseName: {
			type: String,
			description: `Specifies the name to use for the virtual field on the 'from' model.`
		}
	},
	toModel: {
		primaryKey: {
			type: String,
			description: `Specifies which field on the 'from' / 'to' model should be used as the primary key.
						  (This context changes based on hierarchical / non-hierarchical associations)`
		},
		foreignKey: {
			type: String,
			description: `Specifies the name of the field on the 'to' / 'through' model that will hold foreign key.
						  (This context changes based on hierarchical / non-hierarchical associations)`
		},
		relatedName: {
			type: String,
			description: `Specifies the name to use for the virtual field on the 'to' / 'through' model.
						  (This context changes based on hierarchical / non-hierarchical associations)`
		},
		reverseName: {
			type: String,
			description: `Specifies the name to use for the virtual field on the 'to' model.
						  (This is only relevant in non-hierarchical associations)`
		}
	}
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
		if (!this.schema.discriminatorMapping.isRoot) {
			next();
		}

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
