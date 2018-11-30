import mongoose from 'mongoose';
import ChimeraSchema from '../schema';

class ChimeraModel extends mongoose.Model {
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
			.exec();

		return this._register(chimeraModel);
	}

	/**
     * Registers the supplied model as a mongoose model. The supplied model should be pre-populated with all related data.
     * @param {ChimeraModel} model - The pre-populated ChimeraModel instance
     * @param {[ChimeraField]} [model.chimeraFields] - The fields to define into the model schema.
     * @returns {Promise<mongoose.Model>} - The newly registered mongoose Model
     */
	static _register ({ name, chimeraFields }) {
		const chimeraSchema = new ChimeraSchema(
			name,
			chimeraFields.reduce((schemaDef, field) => ({
				...schemaDef,
				[field.name]: field.toObject()
			}), {})
		);

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
