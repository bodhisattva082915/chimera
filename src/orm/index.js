import mongoose from 'mongoose';
import jsonschemaSupport from 'mongoose-schema-jsonschema';
import toJSONTransformation from './plugins/toJSONTransformations';
import ModelRegistry from './registry';

jsonschemaSupport(mongoose);

mongoose.plugin(toJSONTransformation);

const registry = new ModelRegistry();
const staticModules = ['auth'];

/**
 * Asynchronously loads all models (static and dynamic) into the model registry
 */
export async function init () {
	await bootstrap();
	await extend();
}

/**
 * Initalizes a minimal ORM
 */
async function bootstrap () {
	await registry.bootstrap(staticModules);
};

/**
 * Enhances upon the inital ORM by loading implementation specific modeling
 */
async function extend () {
	await registry.compile();
}

export default registry;
