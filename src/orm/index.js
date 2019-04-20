import mongoose from 'mongoose';
import jsonschemaSupport from 'mongoose-schema-jsonschema';
import uniqueValidator from 'mongoose-unique-validator';
import ModelRegistry from './registry';
import * as customFieldTypes from './field/types';

jsonschemaSupport(mongoose);

/**
 * Global Third-Party Plugins
 */
mongoose.plugin(uniqueValidator);

/**
 * Register custom field types
 */
mongoose.Schema.Types = {
	...mongoose.Schema.Types,
	...customFieldTypes
};

const registry = new ModelRegistry({ staticModules: ['auth'] });

export default registry;
