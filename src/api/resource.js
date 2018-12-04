import http from 'http';
import { Router } from 'express';
import mongoose from 'mongoose';

/**
 * Basic resource class to generate RESTful style APIs from model definitions
 */
class ChimeraResource {

	/**
	 * Constructor
	 * @param {object} model - The mongoose model used to generate the resource routes and controller methods
	 * @returns {ChimeraResource} - The resource containing the model's router and route resolvers
	 */
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

		this.router.use(this.defaultHeaders);

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
	 * Adds default headers to route response
	 * @param {object} req
	 * @param {object} res
	 * @param {function} next
	 */
	defaultHeaders (req, res, next) {
		res.type('application/json');
		next();
	}

	/**
	 * Retrieves a single object of the resource type by id
	 */
	async getById (req, res, next) {
		const id = req.params.id;
		const select = req.query.select || [];
		const query = await this.model.findById(id);

		if (select.length) {
			query.select(select);
		}

		let results = {};
		let document;
		try {
			document = await query;
			if (!document) {
				results.error = {
					code: http.STATUS_CODES[404],
					message: `${this.model.modelName} by id ${id} does not exist.`
				};

				return res.status(404).json(results);
			}
			document = document.toJSON();

			if (select.length) {
				this._applySelectToVirutals(document, select);
			}

			results.data = document;
			res.status(200).json(results);
			next();
		} catch (err) {
			next(err);
		}
	}

	/**
	 * Retrieves a list of objects of the resource type
	 */
	async getList (req, res, next) {
		const select = req.query.select || [];
		const where = req.query.where || {};
		const sort = req.query.sort || { createdAt: 'desc' };
		const limit = req.query.limit || 10;
		const page = req.query.page || 1;
		const skip = (page - 1) * limit;
		const meta = {
			page,
			limit,
			sort
		};

		const FilteredQuery = this.model.find().where(where).toConstructor();
		const query = FilteredQuery()
			.sort(sort)
			.limit(limit)
			.skip(skip);

		if (select.length) {
			query.select(select);
		}

		let results = { meta };
		let documents = [];
		try {
			documents = await query;
			documents = documents.map(doc => doc.toJSON());

			if (select.length) {
				this._applySelectToVirutals(documents, select);
			}

			results.meta.count = await FilteredQuery().countDocuments();
			results.data = documents;

			res.status(200).json(results);
			next();
		} catch (err) {
			next(err);
		}
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
	async create (req, res, next) {
		const body = req.body;
		const Model = this.model;
		const instance = new Model(body);
		const results = {};

		try {
			await instance.validate();
		} catch (validationError) {
			results.error = {
				code: http.STATUS_CODES[422],
				message: `Request body fails schema validation.`,
				validationErrors: validationError.errors
			};

			res.status(422).json(results);
		}

		let document;
		try {
			document = await instance.save();
			results.data = document.toJSON();

			res.status(201).json(results);
		} catch (err) {
			next(err);
		}

	}

	/**
	 * Updates a single object of the resource type by id. This differs from replace by id in that this method
	 * will only modify fields passed in the request body.
	 */
	async updateById (req, res, next) {
		const id = req.params.id;
		const body = req.body;
		const Model = this.model;
		const results = {};

		const document = await Model.findById(id);
		if (!document) {
			next(new mongoose.Error.DocumentNotFoundError());
		}

		document.set(body);

		try {
			await document.validate();
			await document.save();

			results.data = document.toJSON();
			res.status(200).json(results);
		} catch (err) {
			next(err);
		}
	}

	/**
	 * Archives / Deletes a single object by id of the resource type
	 */
	deleteById (req, res, next) {
		res.send('deleting resource');
	}

	/**
	 * By default, toJSON includes virtual properties during transformation. The method mutates the supplied obj/objs by
	 * removing virtual properties not in the list of selected fields.
	 * @param {(object|[object])} input - An object or array objects to apply transformations
	 * @param {[string]} select - An array of properties to keep on the obj/objs
	 * @returns {void} - Transforms the input to conform to the select argument.
	 */
	_applySelectToVirutals (objs, select) {
		let applyTo;
		if (!Array.isArray(objs)) {
			applyTo = [objs];
		} else {
			applyTo = objs;
		}

		applyTo.forEach(obj => {
			Object.keys(obj)
				.filter(field => !select.includes(field))
				.forEach(fieldToRemove => delete obj[fieldToRemove]);
		});
	}
}

export default ChimeraResource;
