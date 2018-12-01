import mongoose from 'mongoose';
import each from 'lodash/each';
import { Router } from 'express';
import ChimeraResource from './resource';

const apiRouter = new Router();
const models = mongoose.models;
const resources = {};

each(models, model => {
	const resource = new ChimeraResource(model);

	resources[resource.root] = resource;

	apiRouter.use(`/${resource.root}`, resource.router);
});

export default apiRouter;
