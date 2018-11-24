import fs from 'fs';
import { each } from "lodash";
import mongoose from "mongoose";

const models = [];

fs
	.readdirSync(__dirname)
	.filter(file => !file.includes('.js'))
	.forEach(model => {
		models.push(require(`${__dirname}/${model}`).default);
	});

models.forEach(model => {
	model.associate();
});

/**
 * // TODO: Devise a more elegant approach to this.
 * Run associations and recompile models. Mongoose only compiles models once as it is a costly
 * operation. However, to run associations model registration must be complete to ensure reverse
 * relations can be generated correctly. This calls for a recompilation of models after associations
 * are run to ensure the model class has the newly applied virtuals.
 */
each(mongoose.models, (model, modelKey) => {
	mongoose.models[modelKey] = model.compile(model.modelName, model.schema, model.collection.name, model.db, mongoose);
});