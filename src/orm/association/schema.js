import orm from '../index';
import ChimeraSchema from '../schema';
import validators from './validators';

const schema = new ChimeraSchema('ChimeraAssociation', {
	fromModel: {
		primaryKey: {
			type: String,
			description: `Specifies which field on the 'from' model should be used as the primary key.`,
			default: ''
		},
		foreignKey: {
			type: String,
			description: `Specifies the name of the field on the 'through' model that will hold foreign key.
						  (This is only relevant in non-hierarchical associations)`,
			default: '',
			validate: [...Object.values(validators.fromModel.foreignKey)]
		},
		relatedName: {
			type: String,
			description: `Specifies the name to use for the virtual field on the 'through' model.
						  (This is only relevant in non-hierarchical associations)`,
			default: '',
			validate: [...Object.values(validators.fromModel.relatedName)]
		},
		reverseName: {
			type: String,
			description: `Specifies the name to use for the virtual field on the 'from' model.`,
			default: '',
			validate: [...Object.values(validators.fromModel.reverseName)]
		}
	},
	toModel: {
		primaryKey: {
			type: String,
			description: `Specifies which field on the 'from' / 'to' model should be used as the primary key.
						  (This context changes based on hierarchical / non-hierarchical associations)`,
			default: ''
		},
		foreignKey: {
			type: String,
			description: `Specifies the name of the field on the 'to' / 'through' model that will hold foreign key.
						  (This context changes based on hierarchical / non-hierarchical associations)`,
			default: '',
			validate: [...Object.values(validators.toModel.foreignKey)]
		},
		relatedName: {
			type: String,
			description: `Specifies the name to use for the virtual field on the 'to' / 'through' model.
						  (This context changes based on hierarchical / non-hierarchical associations)`,
			default: '',
			validate: [...Object.values(validators.toModel.relatedName)]
		},
		reverseName: {
			type: String,
			description: `Specifies the name to use for the virtual field on the 'to' model.
						  (This is only relevant in non-hierarchical associations)`,
			default: '',
			validate: [...Object.values(validators.toModel.reverseName)]
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
			err = new orm.Error.ValidatorError({
				type: 'required',
				path: 'type',
				value: this.type,
				message: `Path 'type' is required.`
			});
		} else if (!validDiscriminators.includes(this.type)) {
			err = new orm.Error.ValidatorError({
				type: 'enum',
				path: 'type',
				value: this.type,
				message: `'${this.type}' is not a valid enum value for path 'type'.`,
				enumValues: validDiscriminators
			});
		}

		if (err) {
			const validationError = new orm.Error.ValidationError(this);
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
