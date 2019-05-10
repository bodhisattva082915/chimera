import ChimeraSchema from '../schema';
import orm from '../index';

class ChimeraModel extends orm.Model {

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

	static async compile (ids) {
		const models = await orm.compile(ids);

		return models;
	}

	/**
     * Compiles and registers the defined the ChimeraModel into a mongoose Model
     * @async
     * @returns {Promise<mongoose.Model>} - The newly registered mongoose Model
     */
	async compile () {
		const compiled = await orm.compile(this.id);

		return compiled[0];
	}

	buildSchema (fields) {
		const chimeraSchema = new ChimeraSchema(
			this.namespace,
			fields.reduce((schemaDef, field) => ({
				...schemaDef,
				[field.name]: field.toJSON()
			}), {})
		);

		return chimeraSchema;
	}
}

export default ChimeraModel;
