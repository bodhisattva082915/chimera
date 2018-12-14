import mongoose from 'mongoose';
import ChimeraSchema from '../schema';

class ChimeraModel extends mongoose.Model {

	/**
	 * Queries and populates ChimeraModel(s) with associated support content.
	 */
	static async loadHydrated (where = {}) {
		const chimeraModels = await this.find()
			.where(where)
			.populate('chimeraFields')
			.populate({
				path: 'dominantAssociations',
				populate: [{ path: 'from' }, { path: 'to' }]
			})
			.populate({
				path: 'subordinateAssociations',
				populate: [{ path: 'from' }, { path: 'to' }]
			})
			.populate({
				path: 'fromManyAssociations',
				populate: [{ path: 'from' }, { path: 'to' }, { path: 'through' }]
			})
			.populate({
				path: 'toManyAssociations',
				populate: [{ path: 'from' }, { path: 'to' }, { path: 'through' }]
			});

		return chimeraModels;
	}

	buildSchema (fields) {
		const { name } = this;

		const chimeraSchema = new ChimeraSchema(
			name,
			fields.reduce((schemaDef, field) => ({
				...schemaDef,
				[field.name]: field.toJSON()
			}), {})
		);

		return chimeraSchema;
	}

	/**
     * Compiles and registers the defined ChimeraModel into a mongoose Model by:
     * 1.) Populating the ChimeraModel with all related fields, validators, associations, etc.
     * 2.) Unregistering this model from mongoose if it has already been registered
     * 3.) Registering a new mongoose model from details of the ChimeraModel
     * @async
     * @returns {Promise<mongoose.Model>} - The newly registered mongoose Model
     */
	static async compile (id) {
		const chimeraModel = await this
			.findById(id)
			.populate('chimeraFields')
			.populate({
				path: 'dominantAssociations',
				populate: [
					{ path: 'from' },
					{ path: 'to' }
				]
			})
			.populate({
				path: 'subordinateAssociations',
				populate: [
					{ path: 'from' },
					{ path: 'to' }
				]
			})
			.exec();

		return this._register(chimeraModel);
	}

	/**
     * Registers the supplied model as a mongoose model. The supplied model should be pre-populated with all related data.
     * @param {ChimeraModel} model - The pre-populated ChimeraModel instance
     * @param {[ChimeraField]} [model.chimeraFields] - The fields to define into the model schema.
	* @param {[ChimeraAssociation]} [model.dominantAssociations] - All associations where this model is designated as the 'from' model
	* @param {[ChimeraAssociation]} [model.subordinateAssociations] - All associations where this model is designated as the 'to' model
     * @returns {Promise<mongoose.Model>} - The newly registered mongoose Model
     */
	static _register (chimeraModel) {
		const { name, chimeraFields, dominantAssociations, subordinateAssociations } = chimeraModel;
		const chimeraSchema = new ChimeraSchema(
			name,
			chimeraFields.reduce((schemaDef, field) => ({
				...schemaDef,
				[field.name]: field.toJSON()
			}), {})
		);

		chimeraSchema.associate([...dominantAssociations, ...subordinateAssociations]);

		const registered = mongoose.modelNames().find(modelName => modelName === name);
		if (registered) {
			mongoose.deleteModel(name);
		}

		return mongoose.model(name, chimeraSchema);
	}

	/**
     * Compiles and registers the defined the ChimeraModel into a mongoose Model
     * @async
     * @returns {Promise<mongoose.Model>} - The newly registered mongoose Model
     */
	async compile () {
		return this.constructor.compile(this.id);
	}
}

ChimeraModel.on('compile', ChimeraModel.compile);

export default ChimeraModel;
