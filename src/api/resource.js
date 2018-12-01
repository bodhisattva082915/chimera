import { Router } from 'express';

class ChimeraResource {
	constructor (model) {
		this.model = model;

		this.root = model.modelName.toLowerCase();
		this.router = new Router();

		this.getById = this.getById.bind(this);
		this.getList = this.getList.bind(this);
		this.getSchema = this.getSchema.bind(this);
		this.create = this.create.bind(this);
		this.updateById = this.updateById.bind(this);
		this.deleteById = this.deleteById.bind(this);

		/* eslint-disable indent */
		this.router
			.route('/')
				.get(this.getList)
				.post(this.create);

		this.router
			.route('/describe')
				.get(this.getSchema);

		this.router
			.route('/:id')
				.get(this.getById)
				.patch(this.updateById)
				.delete(this.deleteById);
		/* eslint-enable indent */
	}

	/**
	 * Retrieves a single object by id of the resource type
	 */
	getById (req, res, next) {
		res.send('getting by id');
	}

	/**
	 * Retrieves a list of objects of the resource type
	 */
	getList (req, res, next) {
		res.send('getting resource list');
	}

	/**
	 * Describes the resource by returning the model schema in JSON Schema format
	 */
	getSchema (req, res, next) {
		res.json(this.model.schema.jsonSchema());
		next();
	}

	/**
	 * Create an object of the resource type using the request body as input
	 */
	create (req, res, next) {
		res.send('creating resource');
	}

	/**
	 * Updates a single object by id of the resource type
	 */
	updateById (req, res, next) {
		res.send('updating resource');
	}

	/**
	 * Archives / Deletes a single object by id of the resource type
	 */
	deleteById (req, res, next) {
		res.send('deleting resource');
	}
}

export default ChimeraResource;
