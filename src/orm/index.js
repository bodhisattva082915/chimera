import fs from 'fs';
import mongoose from 'mongoose';
import jsonschemaSupport from 'mongoose-schema-jsonschema';
import toJSONTransformation from './plugins/toJSONTransformations';
import registry from './registry';

jsonschemaSupport(mongoose);

mongoose.plugin(toJSONTransformation);

/**
 * Asynchronously loads all models (static and dynamic) into the model registry
 */
export async function init () {
	/** Load static models into the registry */
	const modules = fs
		.readdirSync(__dirname)
		.filter(file => !file.includes('.js'))
		.filter(file => !file.includes('plugins'));

	for (const moduleName of modules) {
		const { modelClass, schema } = await import(`${__dirname}/${moduleName}`);
		registry.register(modelClass, schema);
	}

	await registry.compile();

	/** Load dynamic models into the registry */
	// Raw mongoose query into mongodb for models
}

export default registry;
