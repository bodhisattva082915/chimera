import mongoose from 'mongoose';
import jsonschemaSupport from 'mongoose-schema-jsonschema';
import uniqueValidator from 'mongoose-unique-validator';
// import toJSONTransformation from './plugins/toJSONTransformations';
// import refreshFromDb from './plugins/refreshFromDb';
import ModelRegistry from './registry';
import * as customFieldTypes from './field/types';

jsonschemaSupport(mongoose);

/**
 * Global Third-Party Plugins
 */
mongoose.plugin(uniqueValidator);
// mongoose.plugin(toJSONTransformation);
// mongoose.plugin(refreshFromDb);

/**
 * Register custom field types
 */
mongoose.Schema.Types = {
	...mongoose.Schema.Types,
	...customFieldTypes
};

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
