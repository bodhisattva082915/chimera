import fs from 'fs';
import path from 'path';
import map from 'lodash/map';
import pickBy from 'lodash/pickBy';
import mongoose from 'mongoose';
import ChimeraSchema from './schema';

/**
 * An extended version of mongoose for registering and compiling models. This class handles bundling together common
 * conveniences like initalizing the db connection and bulk loading models.
 */
class ORM extends mongoose.constructor {

	constructor (options = {}) {

		super(options);

		this.verbose = options.verbose || false;
		this._staticModules = options.staticModules || [];
		this._modelCache = {};
		this._registry = {};

		this.Schema = ChimeraSchema;
	}

	/**
	 * Asynchronously loads all models (static and dynamic) into the model registry
	 */
	async init () {
		await this.initDBConnection();
		await this.bootstrap();
		await this.compile();
	}

	async initDBConnection () {
		await this.connect(
			'mongodb://' +
			`${process.env.NODE_ENV !== 'test' ? process.env.CHIMERADB_USERNAME + ':' : ''}` +
			`${process.env.NODE_ENV !== 'test' ? process.env.CHIMERADB_PASSWORD + '@' : ''}` +
			`${process.env.CHIMERADB_HOST}:` +
			`${process.env.CHIMERADB_PORT}/` +
			`${process.env.CHIMERADB_NAME}`, {
				useNewUrlParser: true,
				useCreateIndex: true
			});

		if (this.verbose) {
			console.info('Chimera DB connection open...');
		}
	}

	async bootstrap () {
		await this._loadGlobalPlugins();
		await this._loadStaticSchemas();
		return this._compile();
	}

	async compile (ids) {
		if (!Array.isArray(ids)) {
			ids = [ids];
		}

		await this._loadDynamicSchemas(ids);

		const namespace = this._idsToNamespace(ids);

		this._applyAssociations(namespace);
		return this._compile(namespace);
	}

	isRegistered (namespace) {
		return !!(namespace in this._registry);
	}

	isCompiled (namespace) {
		return this.modelNames().includes(namespace);
	}

	/**
	 * Loads plugins defined in all static modules into mongoose. This should be called before loading schemas.
	 */
	async _loadGlobalPlugins () {
		await Promise.all([path.basename(__dirname), ...this._staticModules].map(async module => {
			const pluginDir = path.resolve(path.dirname(__dirname), module, 'plugins');
			const plugins = fs.readdirSync(pluginDir);

			for (const pluginFile of plugins) {
				this.plugin(await import(path.resolve(pluginDir, pluginFile)));
			}
		}));
	}

	/**
	 * Loads statically defined schemas into the registry. This should be called after plugins have already been loaded.
	 */
	async _loadStaticSchemas () {
		await Promise.all([path.basename(__dirname), ...this._staticModules].map(async module => {
			const moduleDir = path.resolve(path.dirname(__dirname), module);
			const models = fs
				.readdirSync(moduleDir)
				.filter(file => !file.includes('.js'))
				.filter(file => !file.includes('plugins'))
				.filter(file => !file.includes('migrations'));

			for (const model of models) {
				const { modelClass, schema, discriminators } = await import(path.resolve(moduleDir, model));
				this._register(modelClass, schema, discriminators);

				// Allocate a space in the cache for dynamic content
				this._modelCache[schema.name] = {};
			}
		}));
	}

	/**
	 * Loads dynamically defined schemas into the registry. This should only be called after static models have already been loaded.
	 * @param {[string]} ids - An array of ids specifying a subset of dynamic schemas to load. This is preferrable to reloading all dynamic schemas everytime.
	 * @returns {void}
	 */
	async _loadDynamicSchemas (ids) {
		const where = ids
			? {
				_id: {
					$in: ids
				}
			}
			: {};

		const ChimeraModel = this.model('ChimeraModel');
		const chimeraModels = await ChimeraModel.loadHydrated(where);

		this._modelCache = chimeraModels.reduce((cache, model) => ({
			...cache,
			[model.namespace]: model
		}), this._modelCache);

		chimeraModels.forEach(chimeraModel => {
			const fields = chimeraModel.chimeraFields;
			const schema = chimeraModel.buildSchema(fields);

			this._register(chimeraModel.namespace, schema);
		});
	}

	/**
     * Registers a model to be compiled with mongoose
     * @param {(string | class)} modelClass - A string or a class to be used for the model
     * @param {object} schema - The schema to pair with this model
     */
	_register (modelClass, schema, discriminators) {
		const namespace = schema.name;

		this._registry[namespace] = { modelClass, schema, discriminators };

		return this._registry[namespace];
	}

	/**
	 * Applies associations to registered schemas
     * @param {string} namespace - Specifies a specific model to compile
	 */
	_applyAssociations (namespace) {
		const scope = this._namespaceToScope(namespace);

		scope.forEach(namespace => {
			const registered = this._registry[namespace];
			const model = this._modelCache[namespace];
			const associations = [
				...(model.dominantAssociations || []),
				...(model.subordinateAssociations || []),
				...(model.fromManyAssociations || []),
				...(model.toManyAssociations || [])
			];

			registered.schema.associate(associations);
		});
	}

	/**
     * Compiles current registrations into mongoose models
     * @param {string} namespace - Specifies a specific schema to compile
	 * @param {object} opts - Additional options for configuring the compilation process
     */
	_compile (namespace, opts = {}) {
		const scope = this._namespaceToScope(namespace);
		const compiled = [];

		// For some reason, the User schema in the registry changes back into a regular Schema inisde this loop
		scope.forEach(namespace => {
			const registered = this._registry[namespace];

			if (this.isCompiled(namespace)) {
				this.deleteModel(namespace);
			}

			if (registered.modelClass && registered.modelClass.prototype instanceof mongoose.Model) {
				registered.schema.loadClass(registered.modelClass);
			}

			registered.model = this.model(registered.schema.name, registered.schema);
			compiled.push(registered.model);

			if (registered.discriminators) {
				map(registered.discriminators, (discrimator, discrimatorName) => {

					if (this.isCompiled(discrimatorName)) {
						this.deleteModel(discrimatorName);
					}

					registered.model.discriminator(discrimatorName, discrimator);
				});
			}
		});

		if (opts.uncompiledRegistrants !== false) {
			const fullScope = this._namespaceToScope();

			fullScope.forEach(namespace => {
				if (!this.isCompiled(namespace)) {
					const uncompiled = this._registry[namespace];

					uncompiled.model = this.model(uncompiled.modelClass || uncompiled.schema.name, uncompiled.schema);
					compiled.push(uncompiled.model);
				}
			});
		}

		return compiled;
	}

	_idsToNamespace (ids) {
		let namespace = [];
		if (ids) {
			ids = Array.isArray(ids) ? ids : [ids];
			namespace = Object.keys(pickBy(this._modelCache, model => ids.includes(model.id)));
		} else {
			namespace = Object.keys(this._modelCache);
		}

		return namespace;
	}

	_namespaceToScope (namespace) {
		let scope = [];
		if (namespace) {
			scope = Array.isArray(namespace) ? namespace : [namespace];
			scope.forEach(namespace => {
				if (!this.isRegistered(namespace)) {
					throw new ReferenceError(`'${namespace}' is not a registered namespace.`);
				}
			});
		} else {
			scope = Object.keys(this._registry).filter(namespace => !namespace.startsWith('_'));
		}

		return scope;
	}
}

export default ORM;
