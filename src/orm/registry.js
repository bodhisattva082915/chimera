import fs from 'fs';
import EventEmitter from 'events';
import map from 'lodash/map';
import mongoose from 'mongoose';

/**
 * An interface layer between the application and mongoose for registering and compiling models. This class handles
 * the compilation of models with mongoose and should be used as a lookup point to see which models will be / have
 * been already compiled.
 */
class ModelRegistry extends EventEmitter {

	constructor () {
		super();

		this._modelCache = [];
	}

	/**
	 * Loads statically defined schemas into the registry. This should be called first in order to boostrap the ORM.
	 */
	async loadStaticSchemas () {
		const modules = fs
			.readdirSync(__dirname)
			.filter(file => !file.includes('.js'))
			.filter(file => !file.includes('plugins'));

		for (const moduleName of modules) {
			const { modelClass, schema, discriminators } = await import(`${__dirname}/${moduleName}`);
			this.register(modelClass, schema, discriminators);
		}
	}

	/**
	 * Loads dynamically defined schemas into the registry. This should only be called after static models have already been loaded.
	 * @returns {void}
	 */
	async loadDynamicSchemas () {

		const ChimeraModel = this.model('ChimeraModel');
		const chimeraModels = await ChimeraModel.loadHydrated();

		this._modelCache = chimeraModels.reduce((cache, model) => ({
			...cache,
			[model.name]: model
		}), {});

		chimeraModels.forEach(chimeraModel => {
			const fields = chimeraModel.chimeraFields;
			const schema = chimeraModel.buildSchema(fields);

			this.register(schema.name, schema);
		});
	}

	/**
     * Registers a model to be compiled with mongoose
     * @param {(string | class)} modelClass - A string or a class to be used for the model
     * @param {object} schema - The schema to pair with this model
     */
	register (modelClass, schema, discriminators) {
		const namespace = schema.name;

		this[namespace] = { modelClass, schema, discriminators };
	}

	/**
	 * Applies associations to registered schemas
     * @param {string} namespace - Specifies a specific model to compile
	 */
	applyAssociations (namespace) {
		let scope = [];
		if (namespace) {
			if (!(namespace in this._models)) {
				throw new ReferenceError(`'${namespace}' is not a registered namespace.`);
			}

			scope = [namespace];
		} else {
			scope = Object.keys(this).filter(namespace => !namespace.includes('_'));
		}

		scope.forEach(namespace => {
			const registered = this[namespace];
			const model = this._modelCache[namespace];
			const associations = [...model.dominantAssociations, ...model.subordinateAssociations];

			registered.schema.associate(associations);
		});
	}

	/**
     * Compiles current registrations into mongoose models
     * @param {string} namespace - Specifies a specific schema to compile
     */
	compile (namespace) {
		let scope = [];
		if (namespace) {
			if (!(namespace in this._models)) {
				throw new ReferenceError(`'${namespace}' is not a registered namespace.`);
			}

			scope = [namespace];
		} else {
			scope = Object.keys(this).filter(namespace => !namespace.includes('_'));
		}

		scope.forEach(namespace => {
			const registered = this[namespace];

			if (this.isCompiled(namespace)) {
				mongoose.deleteModel(namespace);
			}

			registered.model = mongoose.model(registered.modelClass || registered.schema.name, registered.schema);

			if (registered.discriminators) {
				map(registered.discriminators, (discrimator, discrimatorName) => {

					if (this.isCompiled(discrimatorName)) {
						mongoose.deleteModel(discrimatorName);
					}

					registered.model.discriminator(discrimatorName, discrimator);
				});
			}
		});
	}

	model (namespace) {
		if (!this.isCompiled(namespace)) {
			return undefined;
		}

		return mongoose.model(namespace);
	}

	isRegistered (namespace) {
		return !!(namespace in this);
	}

	isCompiled (namespace) {
		return mongoose.modelNames().includes(namespace);
	}
}

export default ModelRegistry;
