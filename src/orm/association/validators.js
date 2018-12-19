import mongoose from 'mongoose';

export const fromModelForiegnKeyUniqueUniversally = {
	validator: async function (value) {
		const model = this.constructor;

		if (value && model.modelName === 'NonHierarchicalAssociation') {
			let count = await model.find({
				'fromModelId': this.fromModelId,
				'fromModel.foreignKey': value
			}).countDocuments();
			return (count === 0);
		}

		return true;
	},
	message: 'Error, expected `{PATH}` to be unique. Value: `{VALUE}`',
	type: 'unique'
};

export const fromModelForiegnKeyUniqueSecondary = {
	validator: async function (value) {
		const model = this.constructor;

		if (!value && model.modelName === 'NonHierarchicalAssociation') {
			let count = await model.find({
				'fromModelId': this.fromModelId,
				'toModelId': this.toModelId,
				'fromModel.foreignKey': ''
			}).countDocuments();
			return (count === 0);
		}

		return true;
	},
	message: 'Error, expected `{PATH}` to be unique. Value: `{VALUE}`',
	type: 'unique'
};

export const fromModelRelatedNameUniqueUniversally = {
	validator: async function (value) {
		const model = this.constructor;

		if (value && model.modelName === 'NonHierarchicalAssociation') {
			let count = await model.find({
				'fromModelId': this.fromModelId,
				'fromModel.relatedName': value
			}).countDocuments();
			return (count === 0);
		}

		return true;
	},
	message: 'Error, expected `{PATH}` to be unique. Value: `{VALUE}`',
	type: 'unique'
};

export const fromModelRelatedNameUniqueSecondary = {
	validator: async function (value) {
		const model = this.constructor;

		if (!value && model.modelName === 'NonHierarchicalAssociation') {
			let count = await model.find({
				'fromModelId': this.fromModelId,
				'toModelId': this.toModelId,
				'fromModel.relatedName': ''
			}).countDocuments();
			return (count === 0);
		}

		return true;
	},
	message: 'Error, expected `{PATH}` to be unique. Value: `{VALUE}`',
	type: 'unique'
};

export const fromModelReverseNameUniqueUniversally = {
	validator: async function (value) {
		const model = this.constructor;
		const baseModel = mongoose.model(model.baseModelName);

		if (value) {
			let count = await baseModel.find({
				'fromModelId': this.fromModelId,
				'fromModel.reverseName': value
			}).countDocuments();
			return (count === 0);
		}

		return true;
	},
	message: 'Error, expected `{PATH}` to be unique. Value: `{VALUE}`',
	type: 'unique'
};

export const fromModelReverseNameUniqueSecondary = {
	validator: async function (value) {
		const model = this.constructor;
		const baseModel = mongoose.model(model.baseModelName);

		if (!value) {
			let count = await baseModel.find({
				'fromModelId': this.fromModelId,
				'toModelId': this.toModelId,
				'fromModel.reverseName': ''
			}).countDocuments();

			return (count === 0);
		}

		return true;
	},
	message: 'Error, expected `{PATH}` to be unique. Value: `{VALUE}`',
	type: 'unique'
};
