import mongoose from 'mongoose';
import jsonschemaSupport from 'mongoose-schema-jsonschema';
import toJSONTransformation from './plugins/toJSONTransformations';
import ModelRegistry from './registry';

jsonschemaSupport(mongoose);

mongoose.plugin(toJSONTransformation);

const registry = new ModelRegistry();

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
	await registry.loadStaticSchemas();
	registry.compile();
};

/**
 * Enhances upon the inital ORM by loading implementation specific modeling
 */
async function extend () {
	await registry.loadDynamicSchemas();
	registry.compile();
}

export default registry;
