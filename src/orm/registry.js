import EventEmitter from 'events';
import mongoose from 'mongoose';

/**
 * An interface layer between the application and mongoose for registering and compiling models. This class handles
 * actually compiling models with mongoose and should be used as a lookup point to see which models will be / have
 * been already compiled.
 */
class ModelRegistry extends EventEmitter {

	/**
     * Registers a model to be compiled with mongoose
     * @param {(string | class)} model - A string or a class to be used for the model
     * @param {object} schema - The schema to pair with this model
     */
	register (model, schema) {
		const namespace = schema.name;

		this[namespace] = { model, schema };
	}

	/**
     * Compiles current registrations into mongoose models
     * @param {string} namespace - Specifies a specific model to compile
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
			mongoose.model(registered.model || registered.schema.name, registered.schema);
		});
	}

	getModel (namespace) {
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

export default new ModelRegistry();
